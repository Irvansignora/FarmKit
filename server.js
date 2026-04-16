'use strict';

require('dotenv').config();
const express    = require('express');
const helmet     = require('helmet');
const cors       = require('cors');
const compression = require('compression');
const morgan     = require('morgan');
const rateLimit  = require('express-rate-limit');
const path       = require('path');

const apiRoutes  = require('./routes/api');

const app  = express();
const PORT = process.env.PORT || 3000;
const ENV  = process.env.NODE_ENV || 'development';

// ─── Security: HTTP Headers ───────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'", "'unsafe-inline'"],   // inline JS in index.html
      styleSrc:   ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc:    ["'self'", 'https://fonts.gstatic.com'],
      imgSrc:     ["'self'", 'data:'],
      connectSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000'];

app.use(cors({
  origin: (origin, cb) => {
    // allow requests with no origin (e.g. curl, Postman in dev)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max:      200,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: 'Too many requests, please try again later.' },
});

const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max:      30,
  message:  { error: 'Rate limit exceeded.' },
});

// ─── Body Parsing & Compression ───────────────────────────────────────────────
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: false, limit: '50kb' }));
app.use(compression());

// ─── Logging ──────────────────────────────────────────────────────────────────
app.use(morgan(ENV === 'production' ? 'combined' : 'dev'));

// ─── Static Files ─────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: ENV === 'production' ? '1d' : 0,
  etag:   true,
}));

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api', apiLimiter, apiRoutes);

// Write-heavy endpoints get stricter limiting
app.use('/api/workers',    strictLimiter);
app.use('/api/attendance', strictLimiter);
app.use('/api/harvests',   strictLimiter);

// ─── SPA Catch-all ────────────────────────────────────────────────────────────
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  const msg    = ENV === 'production' ? 'Internal Server Error' : err.message;
  console.error(`[ERROR] ${err.message}`);
  res.status(status).json({ error: msg });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🌾 FarmKit running on http://localhost:${PORT} [${ENV}]`);
});

module.exports = app; // for testing / Vercel serverless
