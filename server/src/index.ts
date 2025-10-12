import express, { Request, Response } from "express";
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080; 

// Serve React build from client/build
app.use('/hockey', express.static(path.join(__dirname, '../../client/build')));

// API example
app.get('/hockey/api/test', (req: Request, res: Response) => {
  res.json({ message: 'API is working!!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});