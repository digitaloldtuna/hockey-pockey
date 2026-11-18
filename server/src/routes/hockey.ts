import express from 'express';
import { getDraftFromId } from '../models/drafts';
import { getProfileFromUserId } from '../models/profiles';
import { getAllTeams } from '../models/teams';
import {
  getGamesThisWeek,
  getHistory,
  getStandings,
  refreshGames,
} from '../services/hockey_service';
import { getDraftLeagueStandings, getDraftStats } from '../services/stats_service';

const router = express.Router();

router.get('/team/all', async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      throw Error('User is not authenticated');
    }

    const teams = await getAllTeams();
    return res.json({ teams });
  } catch (e) {
    return res.status(401).json({ error: `Error: ${e}` });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      throw Error('User is not authenticated');
    }
    await refreshGames();
    return res.json();
  } catch (e) {
    return res.status(401).json({ error: `Error: ${e}` });
  }
});

router.get('/games/thisweek', async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      throw Error('User is not authenticated');
    }
    const draftId = Number(req.query.id);
    const games = await getGamesThisWeek(draftId);
    return res.json({ games });
  } catch (e) {
    return res.status(401).json({ error: `Error: ${e}` });
  }
});

router.get('/member/history', async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      throw Error('User is not authenticated');
    }
    const draftId = Number(req.query.id);
    const draft = await getDraftFromId(draftId);

    const history = await getHistory(draft);
    return res.json({ history });
  } catch (e) {
    return res.status(401).json({ error: `Error: ${e}` });
  }
});

router.get('/standings', async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      throw Error('User is not authenticated');
    }
    const draftId = Number(req.query.id);
    const standings = await getStandings(draftId);
    return res.json({ standings });
  } catch (e) {
    return res.status(401).json({ error: `Error: ${e}` });
  }
});

// player and team stats for the stats page, for people in this draft only
router.get('/stats', async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      throw Error('User is not authenticated');
    }
    const profile = await getProfileFromUserId(user.id);
    const stats = await getDraftStats(Number(req.query.id), profile.id);
    return res.json({ stats });
  } catch (e) {
    return res.status(401).json({ error: `Error: ${e}` });
  }
});

// the NHL's official standings, with who drafted each team
router.get('/league-standings', async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      throw Error('User is not authenticated');
    }
    const profile = await getProfileFromUserId(user.id);
    const result = await getDraftLeagueStandings(Number(req.query.id), profile.id);
    return res.json(result);
  } catch (e) {
    return res.status(401).json({ error: `Error: ${e}` });
  }
});

export default router;
