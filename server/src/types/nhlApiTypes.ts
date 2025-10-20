export type Standing = {
  conferenceName: string;
  divisionName: string;
  gamesPlayed: string;
  placeName: {
    default: string;
  };
  teamName: {
    default: string;
  };
  teamAbbrev: {
    default: string;
  };
  teamLogo: string; // should be a link to the logo
  wins: number;
  losses: number;
  ties: number;
};

export type StandingsNowResponse = {
  standings: Standing[];
  wildCardIndicator: boolean;
  standingsDateTimeUtc: string;
};

export type Team = {
  id: number;
  franchiseId: number;
  fullName: string;
  leagueId: number;
  triCode: string;
  rawTricode: string;
};

export type TeamsResponse = {
  data: Team[];
  total: number;
};
