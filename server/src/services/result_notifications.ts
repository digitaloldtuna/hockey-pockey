import { getInPlayDrafts } from '../models/drafts';
import { Game, getFinishedGamesSince } from '../models/games';
import {
  claimKey,
  claimNotifications,
  findClaimed,
  NotificationClaim,
} from '../models/notification_log';
import { getTeamOwnershipsFromDraft } from '../models/team_ownerships';
import { getPoint, getTeamNickname } from '../utils/mappings';
import {
  buildResultPayload,
  buildSummaryPayload,
  ResultItem,
  SUMMARY_THRESHOLD,
} from './notification_messages';
import { sendToProfile } from './notification_service';

// Only games that started this recently are announced. Games last about three hours, so six leaves
// room for a late run, and it stops a first deploy from announcing last week's results.
const RECENT_HOURS = 6;
// Looking back two days for finished games keeps the query small.
const LOOKBACK_DAYS = 2;
// If a run wants to record more than this, something is wrong; do nothing rather than flood people.
const MAX_CLAIMS_PER_RUN = 200;

const ET = 'America/New_York';

const dateInEastern = (date: Date) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: ET }).format(date); // YYYY-MM-DD

// The games table stores Eastern wall-clock time with a "+00:00" tacked on, so read the clock part
// as Eastern time and turn it into a real instant.
export const easternClockToMs = (iso: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(iso);
  if (!match) return NaN;
  const [year, month, day, hour, minute] = match.slice(1).map(Number);
  const asIfUtc = Date.UTC(year, month - 1, day, hour, minute);
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: ET,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
      .formatToParts(new Date(asIfUtc))
      .map((part) => [part.type, part.value])
  );
  const shown = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute);
  return asIfUtc - (shown - asIfUtc);
};

type Pending = { claim: NotificationClaim; draftName: string; item: ResultItem };

export const sendResultNotifications = async ({
  dryRun = false,
  now = new Date(),
}: { dryRun?: boolean; now?: Date } = {}) => {
  const drafts = await getInPlayDrafts();
  const since = dateInEastern(new Date(now.getTime() - LOOKBACK_DAYS * 24 * 3600 * 1000));
  const cutoff = now.getTime() - RECENT_HOURS * 3600 * 1000;

  // finished games, once per season
  const gamesBySeason = new Map<number, Game[]>();
  for (const season of Array.from(new Set(drafts.map((draft) => draft.season)))) {
    const games = await getFinishedGamesSince({ season, since });
    gamesBySeason.set(
      season,
      games.filter((game) => {
        const started = easternClockToMs(game.easternStartTime);
        return !Number.isNaN(started) && started >= cutoff;
      })
    );
  }

  const pending: Pending[] = [];

  for (const draft of drafts) {
    const games = gamesBySeason.get(draft.season) ?? [];
    if (games.length === 0) continue;

    // who owns which NHL team in this draft
    const ownerOf = new Map<number, { profileId: string; name: string; teamName: string }>();
    (await getTeamOwnershipsFromDraft(draft.id)).forEach((ownership) => {
      const profile = ownership.draftMembership.profile;
      ownerOf.set(Number(ownership.team.apiId), {
        profileId: profile.id,
        name: profile.name,
        teamName: getTeamNickname(ownership.team),
      });
    });

    for (const game of games) {
      const home = ownerOf.get(game.homeTeamId);
      const away = ownerOf.get(game.visitingTeamId);
      // both teams must be owned, by different people, and the game must have a winner
      if (!home || !away || home.profileId === away.profileId) continue;
      if (game.homeScore === game.visitingScore) continue;

      const homeWon = game.homeScore > game.visitingScore;
      const overtime = game.period > 3;

      const side = (
        own: typeof home,
        other: typeof home,
        won: boolean,
        ownScore: number,
        otherScore: number
      ) => {
        pending.push({
          claim: { profile: own.profileId, draft: draft.id, game_id: game.id, kind: 'result' },
          draftName: draft.name,
          item: {
            gameId: game.id,
            won,
            overtime: !won && overtime,
            ownTeam: own.teamName,
            otherTeam: other.teamName,
            otherOwner: other.name,
            ownScore,
            otherScore,
            points: won ? (getPoint(game.gameType) ?? 0) : 0,
          },
        });
      };
      side(home, away, homeWon, game.homeScore, game.visitingScore);
      side(away, home, !homeWon, game.visitingScore, game.homeScore);
    }
  }

  if (pending.length > MAX_CLAIMS_PER_RUN) {
    throw Error(
      `Refusing to send: ${pending.length} notifications in one run is more than expected`
    );
  }

  // keep only the ones not already announced (and, for real runs, record them before sending)
  let fresh: Pending[];
  if (dryRun) {
    const already = await findClaimed(pending.map((entry) => entry.claim));
    fresh = pending.filter((entry) => !already.has(claimKey(entry.claim)));
  } else {
    const claimed = new Set(
      (await claimNotifications(pending.map((entry) => entry.claim))).map(claimKey)
    );
    fresh = pending.filter((entry) => claimed.has(claimKey(entry.claim)));
  }

  // one push per game, or one summary when a person has a lot of results in the same draft
  const groups = new Map<string, Pending[]>();
  fresh.forEach((entry) => {
    const key = `${entry.claim.profile}|${entry.claim.draft}`;
    groups.set(key, [...(groups.get(key) ?? []), entry]);
  });

  let pushes = 0;
  for (const entries of Array.from(groups.values())) {
    const { profile, draft } = entries[0].claim;
    const draftInfo = { id: draft, name: entries[0].draftName };
    const payloads =
      entries.length > SUMMARY_THRESHOLD
        ? [
            buildSummaryPayload(
              draftInfo,
              entries.map((entry) => entry.item)
            ),
          ]
        : entries.map((entry) => buildResultPayload(draftInfo, entry.item));

    for (const payload of payloads) {
      pushes += 1;
      if (dryRun) {
        console.log(`[dry run] to ${profile}: ${payload.title} | ${payload.body} | ${payload.url}`);
      } else {
        await sendToProfile(profile, payload);
      }
    }
  }

  console.log(
    `notifications: ${drafts.length} drafts in play, ${pending.length} results found, ${fresh.length} new, ${pushes} ${dryRun ? 'would be sent' : 'sent'}`
  );
  return { found: pending.length, fresh: fresh.length, pushes };
};
