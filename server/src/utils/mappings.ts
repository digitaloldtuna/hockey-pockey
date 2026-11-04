const seasonMappings: Record<string, number> = {
  2025: 20242025,
  2026: 20252026,
  2027: 20262027,
};

export const getApiSeason = (season: number) => {
  return seasonMappings[String(season)];
};

const pointMapping: Record<string, number> = {
  2: 1,
  3: 2,
};

const finalGameMapping: Record<string, number> = {
  20242025: 2024030416,
};

export const getPoint = (gameType: number) => {
  return pointMapping[String(gameType)];
};

export const isFinalGame = (season: number, gameId: number) => {
  return finalGameMapping[String(season)] === gameId;
};

// short team names for notifications, keyed by the three-letter code
const teamNicknames: Record<string, string> = {
  ANA: 'Ducks',
  BOS: 'Bruins',
  BUF: 'Sabres',
  CGY: 'Flames',
  CAR: 'Hurricanes',
  CHI: 'Blackhawks',
  COL: 'Avalanche',
  CBJ: 'Blue Jackets',
  DAL: 'Stars',
  DET: 'Red Wings',
  EDM: 'Oilers',
  FLA: 'Panthers',
  LAK: 'Kings',
  MIN: 'Wild',
  MTL: 'Canadiens',
  NSH: 'Predators',
  NJD: 'Devils',
  NYI: 'Islanders',
  NYR: 'Rangers',
  OTT: 'Senators',
  PHI: 'Flyers',
  PIT: 'Penguins',
  SEA: 'Kraken',
  SJS: 'Sharks',
  STL: 'Blues',
  TBL: 'Lightning',
  TOR: 'Maple Leafs',
  UTA: 'Mammoth',
  VAN: 'Canucks',
  VGK: 'Golden Knights',
  WSH: 'Capitals',
  WPG: 'Jets',
};

export const getTeamNickname = (team: { code: string; fullName: string }) =>
  teamNicknames[team.code] ?? team.fullName;
