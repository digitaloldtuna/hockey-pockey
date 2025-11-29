import express from 'express';
import { getStandingsNow } from '../services/nhl_api';
import draftRouter from './draft';
import hockeyRouter from './hockey';
import profileRouter from './profile';

const router = express.Router();

router.use('/draft', draftRouter);
router.use('/hockey', hockeyRouter);
router.use('/profile', profileRouter);

export default router;
