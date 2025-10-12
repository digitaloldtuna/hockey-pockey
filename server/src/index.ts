import express from 'express';

const app = express();
const PORT = 8001;

// Middleware
app.use(express.json());

// Basic test route
app.get('/api/test', (req, res) => {
  console.log('GET /api/test hit');
  res.json({ message: 'Backend is working!' });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
