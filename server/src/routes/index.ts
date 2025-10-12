import express from "express";

const router = express.Router();

router.post('/home', async (req, res) => {
  try {
    console.log("home request", req)

    return res.status(200).json({
      message: "success!"
    })
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;