import express from 'express';
import {
  closeDraft,
  createADraft,
  getAllDrafts,
  getDraftFromId,
  joinADraft,
} from '../models/drafts';
import { getProfileFromUserId } from '../models/profiles';
import { submitAndStartDraft } from '../services/draft_service';
import { getLeaderboard } from '../services/hockey_service';

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

router.post('/join', async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      throw Error('User is not authenticated');
    }

    const code = req.body.code;
    const profile = await getProfileFromUserId(user.id);
    const draft = await joinADraft({ code, memberId: profile.id });

    return res.json({ draft });
  } catch (e) {
    return res.status(401).json({ error: `Error: ${e}` });
  }
});

router.post('/close', async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      throw Error('User is not authenticated');
    }

    const { draftId } = req.body;
    const profile = await getProfileFromUserId(user.id);
    await closeDraft({ draftId, memberId: profile.id });
    return res.json({});
  } catch (e) {
    return res.status(401).json({ error: `Error: ${e}` });
  }
});

router.post('/submit', async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      throw Error('User is not authenticated');
    }

    const profile = await getProfileFromUserId(user.id);
    const { draftId, teamAssignments } = req.body;
    await submitAndStartDraft({ profile, draftId, teamAssignments });

    return res.json();
  } catch (e) {
    return res.status(401).json({ error: `Error: ${e}` });
  }
});

router.get('/leaderboard', async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      throw Error('User is not authenticated');
    }

    const draftId = Number(req.query.id);
    const leaderboard = await getLeaderboard(draftId);
    return res.json({ leaderboard });
  } catch (e) {
    return res.status(401).json({ error: `Error: ${e}` });
  }
});

export default router;
