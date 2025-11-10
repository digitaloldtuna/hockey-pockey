import express from 'express';
import { getProfileFromUserId, updateProfile } from '../models/profiles';

const router = express.Router();

router.get('/', async (req, res) => {
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

router.post('/update', async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      throw Error('User is not authenticated');
    }

    const dataToUpdate = req.body.profile;
    const profile = await updateProfile({ userId: user.id, profile: dataToUpdate });
    return res.json({ profile });
  } catch (e) {
    return res.status(401).json({ error: `Error: ${e}` });
  }
});

export default router;
