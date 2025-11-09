import { Draft } from './types';

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
};
