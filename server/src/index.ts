import path from 'path';
import express from 'express';

const app = express();
const PORT = process.env.PORT || 8001;

// Serve static React files
app.use(express.static(path.join(__dirname, '../client/build')))

// API routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Serve React app for all other routes (SPA support)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
