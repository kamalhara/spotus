const express = require('express');
const cors = require('cors');
const notificationsRouter = require('./routes/notifications');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/notifications', notificationsRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;
