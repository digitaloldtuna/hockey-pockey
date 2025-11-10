import express from 'express';
import { getStandingsNow } from '../services/nhlApi';
import draftRouter from './draft';
import hockeyRouter from './hockey';
import profileRouter from './profile';

const router = express.Router();

router.use('/draft', draftRouter);
router.use('/hockey', hockeyRouter);
router.use('/profile', profileRouter);

router.get('/standings', async (req, res) => {
  const data = await getStandingsNow();
  console.log('standings:', data);
  return res.json(data.standings);
});

export default router;
