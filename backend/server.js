const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/event-types', require('./routes/eventTypeRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/exports', require('./routes/exportRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Serve frontend
app.use(express.static(path.join(__dirname, 'dist')));

// Catch-all route to serve React's index.html for unknown routes (fixes routing issues)
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));