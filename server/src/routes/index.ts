import express from 'express';
import { getAllEnvVariables } from '../models/env';
import draftRouter from './draft';
import hockeyRouter from './hockey';
import profileRouter from './profile';

const router = express.Router();

router.use('/draft', draftRouter);
router.use('/hockey', hockeyRouter);
router.use('/profile', profileRouter);
router.get('/config', async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      throw Error('User is not authenticated');
    }
    const variables = await getAllEnvVariables();
    const simplifiedVariables = variables.reduce(
      (arr, variable) => {
        arr[variable.name] = variable.value;
        return arr;
      },
      {} as Record<string, any>
    );
    return res.json({ variables: simplifiedVariables });
  } catch (e) {
    return res.status(401).json({ error: `Error: ${e}` });
  }
});

export default router;
