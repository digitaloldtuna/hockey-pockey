import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from "express";
import authRoutes from './routes/auth';
import bodyParser from 'body-parser';
import cors from 'cors';

const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080; 

// Serve React build from client/build
app.use('/hockey', express.static(path.join(__dirname, '../../client/build')));

app.use(cors({
  origin: 'http://localhost:3000', // frontend origin
  credentials: true, // if you're using cookies
}));

// // API example
// app.get('/hockey/api/test', (req: Request, res: Response) => {
//   res.json({ message: 'API is working!!' });
// });

app.use(bodyParser.json());
app.use('/hockey/api', authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
