import express from 'express';

const router = express.Router();

router.post('/home', async (_, res) => {
  try {
    return res.status(200).json({
      message: 'success!',
    });
  } catch (err) {
    return res.status(500).json({ error: `Internal server error: ${err}` });
  }
});

export default router;
