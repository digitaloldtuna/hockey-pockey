export const ROUTE_PREFIX = '';

// the tabs of a draft that is in play; home is the draft's own address, the rest add a segment
export const DRAFT_TABS = ['home', 'standings', 'stats', 'history'] as const;
export type DraftTab = (typeof DRAFT_TABS)[number];

export const ROUTES = {
  LOGIN: `${ROUTE_PREFIX}/login`,
  SIGNUP: `${ROUTE_PREFIX}/signup`,
  HOME: `${ROUTE_PREFIX}/`,
  DRAFT: {
    CREATE: `${ROUTE_PREFIX}/draft/create`,
    JOIN: `${ROUTE_PREFIX}/draft/join`,
    // matches /draft/3 and /draft/3/stats
    VIEW: `${ROUTE_PREFIX}/draft/:draftId/:tab?`,
  },
};

// /draft/3 for home, /draft/3/stats for a tab
export const draftPath = (draftId: number | string, tab: DraftTab = 'home') =>
  `${ROUTE_PREFIX}/draft/${draftId}${tab === 'home' ? '' : `/${tab}`}`;
