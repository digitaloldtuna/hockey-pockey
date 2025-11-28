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
