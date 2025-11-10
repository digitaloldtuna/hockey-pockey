import express from 'express';
import { getAllTeams } from '../models/teams';

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

export default router;
