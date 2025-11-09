import { DraftStatus } from './types';

export const DraftStatusLabel: Record<DraftStatus, string> = {
  open: 'open',
  closed: 'closed',
  team_selection: 'team selection',
  in_play: 'in play',
};
