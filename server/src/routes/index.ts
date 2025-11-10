import express from 'express';
import { getProfileFromUserId } from '../models/profiles';
import { getStandingsNow } from '../services/nhlApi';
import draftRouter from './draft';
import hockeyRouter from './hockey';

const router = express.Router();

router.use('/draft', draftRouter);
router.use('/hockey', hockeyRouter);

router.get('/profile', async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      throw Error('User is not authenticated');
    }

    const profile = await getProfileFromUserId(user.id);
    return res.json({ profile });
  } catch (e) {
    return res.status(401).json({ error: `Error: ${e}` });
  }
});

router.get('/standings', async (req, res) => {
  const data = await getStandingsNow();
  console.log('standings:', data);
  return res.json(data.standings);
});

export default router;
