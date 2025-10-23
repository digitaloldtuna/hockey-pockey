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
  members?: Profile[];
};
