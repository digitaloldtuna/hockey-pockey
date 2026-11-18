export type Session = {
  authenticated: boolean;
  user?: User;
  profile?: Profile;
};

export type Profile = {
  id: string;
  name: string;
  created_at: string;
  user: string;
  email?: string;
  profileImage?: string;
  colour?: string; // hex colour the member picked for themselves
};

export type Draft = {
  id: string;
  name: string;
  season: number;
  members: Profile[];
  status: DraftStatus;
  code?: string;
  owner?: string; // profile id
};

export type DraftStatus = 'open' | 'closed' | 'team_selection' | 'in_play';

export type User = {
  email: string;
};

export type Team = {
  id: number;
  apiId: number;
  franchiseId: number;
  fullName: string;
  code: string;
  leagueId: number;
  logo: string;
  divisionName: string;
  conferenceName: string;
  owner?: string;
};

export type Game = {
  id: number;
  easternStartTime: string; // ISO date string
  gameDate: string; // ISO date string (YYYY-MM-DD)
  gameNumber: number;
  gameScheduleStateId: number;
  gameStateId: number;
  gameType: number;
  homeScore: number;
  homeTeam?: Team;
  homeMember?: Profile;
  period: number;
  season: number;
  visitingScore: number;
  visitingTeam?: Team;
  visitingMember?: Profile;
};

export type Standing = Team & {
  member: Profile;
  wins: number;
  loses: number;
  lt: boolean[];
  streak: {
    type: 'w' | 'l';
    value: number;
  };
  win_rate: number;
};

export type EnvVariables = {
  currentSeason: number;
  lastRefreshed: Date;
};

// ---- /hockey/stats ----

export type StatsTeam = { code: string; fullName: string; logo?: string };

export type StatsPlayer = {
  id: number;
  name: string;
  headshot: string;
  team: string; // three-letter code
  teamName: string; // "Edmonton Oilers"
};

// a player's numbers only in the games between two people's teams
type VersusSide = {
  scorer: (StatsPlayer & { goals: number; points: number; gamesPlayed: number }) | null;
  goalie:
    | (StatsPlayer & { saves: number; savePercentage: number; wins: number; gamesPlayed: number })
    | null;
};

// you against one other person in the draft
export type HeadToHead = {
  wins: number; // games your teams won against theirs
  losses: number; // games their teams won against yours
  points: { mine: number; theirs: number }; // leaderboard points
  myBestTeam: { team: StatsTeam; wins: number } | null; // your team that has beaten them most
  theirBestTeam: { team: StatsTeam; wins: number } | null; // their team that has beaten you most
  upcoming: [string, Game[]][]; // games between your teams and theirs in the next few days, by day
  nextMeeting: Game | null; // the next game between you, however far off
  // each side's best scorer and goalie in the games between you; null until all are counted
  bestPlayers: { mine: VersusSide; theirs: VersusSide } | null;
  gamesStillToCount: number; // finished games between you whose player stats are still loading
};

export type OwnerStats = {
  member: Profile;
  teams: StatsTeam[];
  goals: number | null;
  bestScorer: (StatsPlayer & { goals: number; points: number; gamesPlayed: number }) | null;
  bestGoalie:
    | (StatsPlayer & { saves: number; savePercentage: number; wins: number; gamesPlayed: number })
    | null;
};

type Owned = { member: Profile | null };

// a section is null when the NHL could not be reached for it
export type DraftStats = {
  season: number;
  owners: OwnerStats[];
  clutch:
    | (StatsPlayer & { member: Profile; gameWinningGoals: number; overtimeGoals: number })[]
    | null;
  leaders: {
    goals: (StatsPlayer & Owned & { goals: number })[];
    saves: (StatsPlayer & Owned & { saves: number; savePercentage: number })[];
  } | null;
  headToHead: Record<string, HeadToHead>; // keyed by the other person's profile id
};

// ---- /hockey/league-standings ----

export type LeagueStanding = {
  code: string;
  name: string;
  logo: string;
  conference: string;
  division: string;
  leagueRank: number;
  conferenceRank: number;
  divisionRank: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  otLosses: number;
  points: number;
  pointPct: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifferential: number;
  lastTen: string; // "8-1-1"
  streak: string | null; // "W5"
  clinched: string | null; // "x", "y", "z" or "p"
  member: Profile | null; // who drafted this team
};
