const express = require('express');
const cors = require('cors');
const { clerkMiddleware } = require('@clerk/express');
const notificationsRouter = require('./routes/notifications');
const roomsRouter = require('./routes/rooms');
const uploadsRouter = require('./routes/uploads');
const { db } = require('./config/firebase');

const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable('x-powered-by');
app.use(cors({
  origin(origin, callback) {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      (process.env.NODE_ENV !== 'production' && allowedOrigins.length === 0)
    ) {
      return callback(null, true);
    }
    return callback(new Error('Origin is not allowed'));
  },
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
}));
app.use(express.json({ limit: '64kb' }));
app.use(clerkMiddleware());
app.use((req, res, next) => {
  req.requestId = req.get('x-request-id') || require('crypto').randomUUID();
  res.set('x-request-id', req.requestId);
  res.set('x-content-type-options', 'nosniff');
  res.set('referrer-policy', 'no-referrer');
  res.set('cache-control', 'no-store');
  const startedAt = process.hrtime.bigint();
  res.on('finish', () => {
    if (!['/ping', '/health', '/ready'].includes(req.path)) {
      console.log('Request completed', {
        requestId: req.requestId,
        method: req.method,
        path: req.path,
        status: res.statusCode,
        durationMs: Number(process.hrtime.bigint() - startedAt) / 1e6,
      });
    }
  });
  next();
});

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
    status: firebaseConnected ? 'ok' : 'degraded',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    services: {
      firebase: firebaseConnected
    }
  });
});

app.get('/ready', async (req, res) => {
  try {
    await Promise.race([
      db.listCollections(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000)),
    ]);
    res.status(200).json({ status: 'ready', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ status: 'not_ready', timestamp: new Date().toISOString() });
  }
});

// Routes
app.use('/api/notifications', notificationsRouter);
app.use('/api/rooms', roomsRouter);
app.use('/api/uploads', uploadsRouter);

app.use('/api', (req, res) => {
  res.status(404).json({
    error: { code: 'NOT_FOUND', message: 'API route not found.' },
    requestId: req.requestId,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const status = Number(err.status) || (err.type === 'entity.too.large' ? 413 : 500);
  const isServerError = status >= 500;
  const isExpectedError = Number.isInteger(err.status);
  console.error('Request failed', {
    requestId: req.requestId,
    method: req.method,
    path: req.path,
    code: err.code,
    message: err.message,
    stack: isServerError ? err.stack : undefined,
  });
  res.status(status).json({
    error: {
      code: err.code || (isServerError ? 'INTERNAL_ERROR' : 'REQUEST_FAILED'),
      message: isServerError && !isExpectedError ? 'Something went wrong. Please try again.' : err.message,
      ...(err.details ? { details: err.details } : {}),
    },
    requestId: req.requestId,
  });
});

module.exports = app;
