import { PushPayload } from './notification_service';

// What a person's team did in one finished game.
export type ResultItem = {
  gameId: number;
  won: boolean;
  overtime: boolean;
  ownTeam: string; // nickname, e.g. "Maple Leafs"
  otherTeam: string;
  otherOwner: string; // display name of whoever owns the other team
  ownScore: number;
  otherScore: number;
  points: number; // points a win earns, 0 for a loss
};

export const SUMMARY_THRESHOLD = 3; // more results than this in one draft are combined into one push

const truncate = (text: string, max: number) =>
  text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;

// "Daniel" -> "Daniel's", "Chris" -> "Chris's"
export const possessive = (name: string) => `${truncate(name, 16)}'s`;

// "Maple Leafs" -> "Leafs"
const shortName = (nickname: string) => nickname.split(' ').slice(-1)[0];

const draftUrl = (draftId: number) => `/draft/${draftId}`;

export const buildResultPayload = (
  draft: { id: number; name: string },
  item: ResultItem
): PushPayload => {
  const draftName = truncate(draft.name, 24);
  const score = `${item.ownScore}-${item.otherScore}`;
  const other = `${possessive(item.otherOwner)} ${item.otherTeam}`;

  if (item.won) {
    const points = item.points > 0 ? `. +${item.points} ${item.points === 1 ? 'pt' : 'pts'}` : '';
    return {
      title: `🎉 ${draftName}: you won!`,
      body: `Your ${item.ownTeam} beat ${other} ${score}${points}`,
      tag: `result-${draft.id}-${item.gameId}`,
      url: draftUrl(draft.id),
    };
  }

  return {
    title: `💀 ${draftName}: you lost${item.overtime ? ' in overtime' : ''}`,
    body: `Your ${item.ownTeam} lost to ${other} ${score}${item.overtime ? ' (OT)' : ''}`,
    tag: `result-${draft.id}-${item.gameId}`,
    url: draftUrl(draft.id),
  };
};

export const buildSummaryPayload = (
  draft: { id: number; name: string },
  items: ResultItem[]
): PushPayload => {
  const draftName = truncate(draft.name, 24);
  const wins = items.filter((item) => item.won).length;
  const losses = items.length - wins;

  const parts = [];
  if (wins > 0) parts.push(`${wins} ${wins === 1 ? 'win' : 'wins'}`);
  if (losses > 0) parts.push(`${losses} ${losses === 1 ? 'loss' : 'losses'}`);
  const emoji = wins > losses ? '🎉' : losses > wins ? '💀' : '🏒';

  const shown = items
    .slice(0, 3)
    .map(
      (item) =>
        `${item.won ? 'W' : 'L'} ${shortName(item.ownTeam)} ${item.ownScore}-${item.otherScore} ${shortName(item.otherTeam)}`
    );
  const more = items.length - shown.length;

  return {
    title: `${emoji} ${draftName}: ${parts.join(', ')}`,
    body: `${shown.join(', ')}${more > 0 ? ` and ${more} more` : ''}`,
    tag: `results-${draft.id}`,
    url: draftUrl(draft.id),
  };
};
