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
};

export type Draft = {
  id: string;
  name: string;
  season: number;
  members: { id: string; name: string }[];
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
};
