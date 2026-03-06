const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet()); // Protects against XSS, clickjacking, and sets secure HTTP headers

// Apply Rate Limiting to prevent brute-force & DDoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per `window` (here, per 15 minutes)
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter);

// General Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' })); // Limit JSON payload size to prevent DOS
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies

// ── Request Logger ──────────────────────────────────────────────────
// Logs every incoming request and its response status + time
app.use((req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  res.on('finish', () => {
    const ms = Date.now() - start;
    const statusColor = res.statusCode >= 500 ? '❌' : res.statusCode >= 400 ? '⚠️ ' : '✅';
    console.log(`${statusColor} [${timestamp}] ${req.method} ${req.originalUrl} → ${res.statusCode} (${ms}ms)`);
  });
  next();
});
// ───────────────────────────────────────────────────────────────────

// ── Supabase Connectivity Check ────────────────────────────────────
console.log('🔍 [startup] Checking environment variables...');
if (!process.env.SUPABASE_URL) {
  console.error('❌ [startup] SUPABASE_URL not found in .env');
  process.exit(1);
}
if (!process.env.SUPABASE_KEY) {
  console.error('❌ [startup] SUPABASE_KEY not found in .env');
  process.exit(1);
}
console.log('✅ [startup] Environment variables loaded');

// ── Route Loading with Error Handling ──────────────────────────────
let dataRoutes, userRoutes, historyRoutes, sessionRoutes;

try {
  console.log('🔍 [startup] Loading routes...');
  dataRoutes = require('./routes/dataRoutes');
  console.log('  ✅ dataRoutes loaded');
  userRoutes = require('./routes/userRoutes');
  console.log('  ✅ userRoutes loaded');
  historyRoutes = require('./routes/historyRoutes');
  console.log('  ✅ historyRoutes loaded');
  sessionRoutes = require('./routes/sessionRoutes');
  console.log('  ✅ sessionRoutes loaded');
} catch (err) {
  console.error('❌ [startup] Failed to load routes:', err.message);
  console.error(err.stack);
  process.exit(1);
}

// Mount Routes
app.use('/api/data', dataRoutes);
app.use('/api/users', userRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/sessions', sessionRoutes);

// ── Health Check Endpoint ──────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Rate Limit Bypass for Tests ────────────────────────────────────
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'test') {
    // Skip rate limiting in test mode
    return next();
  }
  next();
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`✅ [server] Server running on http://localhost:${PORT}`);
  console.log(`✅ [server] Environment: ${process.env.NODE_ENV || 'production'}`);
});

// ── Keep the event loop alive ────────────────────────────────────────
// Two dependencies call .unref() on their internal timers intentionally:
//   • express-rate-limit v8  (MemoryStore cleanup — every 900s)
//   • @supabase/auth-js      (_startAutoRefresh — every 30s)
// When ALL timers are unreffed, Node drains the event loop and exits.
// We fix this by explicitly calling .ref() on the underlying TCP socket
// so the server stays alive as long as it is listening for connections.
server.on('listening', () => {
  if (server._handle && typeof server._handle.ref === 'function') {
    server._handle.ref();
    console.log('✅ [server] TCP handle ref\'d — event loop will stay alive.');
  }
});

// ── Graceful Shutdown Handler ──────────────────────────────────────
const gracefulShutdown = (signal) => {
  console.log(`\n📢 [shutdown] Received ${signal}, shutting down gracefully...`);
  server.close(() => {
    console.log('✅ [shutdown] Server closed');
    process.exit(0);
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('❌ [shutdown] Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// ── Uncaught Exception Handler ────────────────────────────────────
process.on('uncaughtException', (err) => {
  console.error('❌ [fatal] Uncaught Exception:', err.message);
  console.error(err.stack);
  process.exit(1);
});

// ── Unhandled Promise Rejection Handler ───────────────────────────
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ [fatal] Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Gracefully handle unexpected errors so the process doesn't silently die
server.on('error', (err) => {
  console.error('❌ [server] Fatal error:', err.message);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Kill the other process or change PORT in .env`);
  }
  process.exit(1);
});
