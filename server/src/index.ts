import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from "express";
import authRoutes from './routes/auth';
import routes from './routes/index';
import bodyParser from 'body-parser';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { verifyToken } from './middlewares/verifyToken';

const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080; 

const isProduction = process.env.NODE_ENV === 'production';

const corsOptions = {
  origin: isProduction
    ? process.env.CORS_ORIGIN_PROD
    : process.env.CORS_ORIGIN_DEV,
  credentials: true, // if you're using cookies
};

app.use(cors(corsOptions));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many login/signup attempts. Please try again later.',
});

console.log('out here')
app.use('/hockey', express.static(path.join(__dirname, '../../client/build')));
app.get('/hockey/*splat', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/build', 'index.html'));
});

app.use(bodyParser.json()); // what does this do?
app.use('/hockey/api/authentication', authRoutes, authLimiter);
app.use('/hockey/api', verifyToken, routes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
