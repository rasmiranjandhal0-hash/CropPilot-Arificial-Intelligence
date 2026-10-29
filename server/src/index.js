import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config, validateConfig } from './config.js';
import conversationsRouter from './routes/conversations.js';
import chatRouter from './routes/chat.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

validateConfig();

const app = express();

// Trust reverse proxy (essential for Render and other cloud hosts behind load balancers)
app.set('trust proxy', 1);

// Security headers with Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Cross-Origin Resource Sharing
const parseAllowedOrigins = () => {
  const origins = ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'];
  if (config.clientUrl) {
    const raw = config.clientUrl.split(',').map((o) => o.trim()).filter(Boolean);
    for (const url of raw) {
      origins.push(url);
      origins.push(url.replace(/\/+$/, ''));
    }
  }
  return [...new Set(origins)];
};

const allowedOrigins = parseAllowedOrigins();

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, uptime/health checks)
      if (!origin) return callback(null, true);

      if (
        config.clientUrl === '*' ||
        allowedOrigins.includes(origin) ||
        allowedOrigins.includes(origin.replace(/\/+$/, '')) ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS error: Origin ${origin} is not allowed.`));
    },
    credentials: true,
  })
);

// Body parser
app.use(express.json({ limit: '1mb' }));

// Global rate limiting: 120 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'TooManyRequests',
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
});
app.use(globalLimiter);

// Specific rate limit for AI chat queries (e.g. 30 requests per minute)
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: {
    error: 'TooManyRequests',
    message: 'Rate limit exceeded for chat messages. Please wait a moment before sending another message.',
  },
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'ChatPilot API',
  });
});

// API Routes
app.use('/api/conversations', conversationsRouter);
app.use('/api/chat', chatLimiter, chatRouter);

// 404 handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'NotFound',
    message: `API route ${req.method} ${req.baseUrl} not found.`,
  });
});

// Serve frontend build if present (e.g. single-service fullstack deployment)
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Centralized error handler
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  console.log(`\n🚀 ChatPilot Server running on http://localhost:${config.port}`);
  console.log(`📡 Accepting client requests from ${config.clientUrl}\n`);
});
