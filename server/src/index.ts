import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import { authenticate } from './middlewares/authMiddleware';
import authRouter from './routes/auth';
import router from './routes/index';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

// Railway puts a proxy in front of the app; trusting it lets rate limits see the real visitor
app.set('trust proxy', 1);

console.log('setting up APIs');

// Enable CORS for all routes
if (process.env.NODE_ENV === 'development') {
  app.use(
    cors({
      origin: 'http://localhost:3000', // Or '*' for public APIs
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'], // Add other custom headers if needed
      credentials: true, // Only if you're sending cookies or auth headers
    })
  );
}
app.use(cookieParser());
app.use(express.json());
app.use('/healthcheck', (req, res) => {
  return res.json({ message: 'It works!' });
});
app.use('/api/authentication', authRouter);
app.use('/api', authenticate, router);
// an unknown API path is an error, not a reason to send back the web page
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

// Serve frontend
app.use(express.static(path.join(__dirname, '../../client/build')));
app.get('*splat', (_req, res) => {
  res.sendFile(path.join(__dirname, '../../client/build', 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
