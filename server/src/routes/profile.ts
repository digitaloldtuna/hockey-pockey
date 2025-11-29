import express from 'express';
import { getProfileFromUserId, updateProfile } from '../models/profiles';
import multer from 'multer';
import { supabaseAdmin } from '../supabase';
import { updateProfileService } from '../services/profile_service';

const upload = multer({ storage: multer.memoryStorage() });
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

router.post('/update', upload.single('profileImage'), async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'User is not authenticated' });
    }

    // Grab other fields from form-data
    const { name, email } = req.body;
    const profile = await updateProfileService(user.id, { file: req.file, name, email });

    return res.json({ profile });
  } catch (e) {
    console.error(e);
    return res.status(400).json({ error: `Error: ${e}` });
  }
});

export default router;
