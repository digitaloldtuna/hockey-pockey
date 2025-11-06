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
};

export type DraftStatus = 'open' | 'closed' | 'in_play';

export type User = {
  email: string;
};
