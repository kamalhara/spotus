const express = require('express');
const cors = require('cors');
const { clerkMiddleware } = require('@clerk/express');
const notificationsRouter = require('./routes/notifications');
const { db } = require('./config/firebase');

const app = express();

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

// Keep-alive ping route for Render
app.get('/ping', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', async (req, res) => {
  let firebaseConnected = false;
  try {
    await Promise.race([
      db.listCollections(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
    ]);
    firebaseConnected = true;
  } catch (error) {
    console.warn('Health check: Firebase connectivity failed:', error.message);
  }

  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    services: {
      firebase: firebaseConnected
    }
  });
});

// Routes
app.use('/api/notifications', notificationsRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;
