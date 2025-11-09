import { Draft, Team } from './types';

export const MOCKED_DRAFTS: Record<string, Draft> = {
  '1': {
    id: '1',
    name: 'Open Draft',
    season: 2026,
    status: 'open',
    members: [{ id: '1', name: 'Mai' }],
    code: '12345code',
    owner: '1',
  },
  '2': {
    id: '2',
    name: 'Closed Draft',
    season: 2025,
    status: 'closed',
    members: [
      { id: '1', name: 'Mai' },
      { id: '2', name: 'Adele' },
      { id: '3', name: 'Amy' },
      { id: '4', name: 'Sophie' },
    ],
  },
  '3': {
    id: '3',
    name: 'In Play Draft',
    season: 2026,
    status: 'in_play',
    members: [
      { id: '3', name: 'Amy' },
      { id: '1', name: 'Mai' },
      { id: '5', name: 'Bob' },
      { id: '6', name: 'Jim' },
      { id: '2', name: 'Adele' },
      { id: '4', name: 'Sophie' },
    ],
  },
  '4': {
    id: '4',
    name: 'Team Selection',
    season: 2026,
    status: 'team_selection',
    members: [
      { id: '3', name: 'Amy' },
      { id: '1', name: 'Mai' },
      { id: '5', name: 'Bob' },
      { id: '6', name: 'Jim' },
      { id: '2', name: 'Adele' },
      { id: '4', name: 'Sophie' },
    ],
  },
};

export const MOCKED_TEAMS: Record<string, Team> = {
  [1]: {
    id: 1,
    apiId: 13,
    franchiseId: 33,
    fullName: 'Florida Panthers',
    code: 'FLA',
    leagueId: 133,
    logo: 'https://assets.nhle.com/logos/nhl/svg/FLA_light.svg',
    divisionName: 'Atlantic',
    conferenceName: 'Eastern',
  },
  [2]: {
    id: 2,
    apiId: 5,
    franchiseId: 17,
    fullName: 'Pittsburg Penguins',
    code: 'PIT',
    leagueId: 133,
    logo: 'https://assets.nhle.com/logos/nhl/svg/PIT_light.svg',
    divisionName: 'Metropolitan',
    conferenceName: 'Eastern',
  },
  [3]: {
    id: 3,
    apiId: 26,
    franchiseId: 14,
    fullName: 'Los Angeles Kings',
    code: 'LAK',
    leagueId: 133,
    logo: 'https://assets.nhle.com/logos/nhl/svg/LAK_light.svg',
    divisionName: 'Pacific',
    conferenceName: 'Western',
  },
};
