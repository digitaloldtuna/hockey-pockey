import express from 'express';
import { createADraft, getAllDrafts, getDraftFromId } from '../models/drafts';
import { getProfileFromUserId } from '../models/profiles';

const router = express.Router();

router.get('', async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      throw Error('User is not authenticated');
    }

    const profile = await getProfileFromUserId(user.id);
    const draftId = Number(req.query.id);
    const draft = await getDraftFromId(draftId, profile.id);
    return res.json({ draft });
  } catch (e) {
    return res.status(401).json({ error: `Error: ${e}` });
  }
});

router.get('/all', async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      throw Error('User is not authenticated');
    }

    const profile = await getProfileFromUserId(user.id);
    const drafts = await getAllDrafts({ profile });

    return res.json({ drafts });
  } catch (e) {
    return res.status(401).json({ error: `Error: ${e}` });
  }
});

router.post('/create', async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      throw Error('User is not authenticated');
    }

    const name = req.body.name;
    const profile = await getProfileFromUserId(user.id);
    const draft = await createADraft({ owner: profile, name });

    return res.json({ draft });
  } catch (e) {
    return res.status(401).json({ error: `Error: ${e}` });
  }
});

export default router;
