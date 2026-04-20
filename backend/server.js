require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const githubRoutes = require('./routes/github');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/github', githubRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'DevPulse API running' });
});

// MongoDB connection (optional caching layer)
if (process.env.MONGODB_URI) {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log('MongoDB connection skipped:', err.message));
}

app.listen(PORT, () => {
  console.log(`DevPulse backend running on port ${PORT}`);
});
