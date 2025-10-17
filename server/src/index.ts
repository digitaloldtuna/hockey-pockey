import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import { authenticate } from './middlewares/authMiddleware';
import authRouter from './routes/auth';
import router from './routes/index';

const app = express();

console.log('setting up APIs');

app.use(express.json());
app.use('/healthcheck', (req, res) => {
  console.log('in healthcheck');
  return res.json({ message: 'It works!' });
});
app.use('/api/authentication', authRouter);
app.use('/api/*splat', authenticate, router);

// Serve frontend
app.use(express.static(path.join(__dirname, '../../client/build')));
app.get('*splat', (_req, res) => {
  console.log('hitting catch all');
  res.sendFile(path.join(__dirname, '../../client/build', 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
