import express from 'express';
import { getDraftFromId } from '../models/drafts';
import { getProfileFromUserId } from '../models/profiles';
import { getAllTeams } from '../models/teams';
import { getGamesThisWeek, getHistory, refreshGames } from '../services/hockey_service';

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
    const profile = await getProfileFromUserId(user.id);

    const history = await getHistory(profile, draft);
    return res.json({ history });
  } catch (e) {
    return res.status(401).json({ error: `Error: ${e}` });
  }
});

export default router;
