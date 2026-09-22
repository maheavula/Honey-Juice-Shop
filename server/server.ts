import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { PersistenceService } from './services/persistenceService.js';
import { authMiddleware } from './middleware/authMiddleware.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/auth.routes.js';
import customerRoutes from './routes/customer.routes.js';
import juicesRoutes from './routes/juices.routes.js';
import ordersRoutes from './routes/orders.routes.js';
import adminRoutes from './routes/admin.routes.js';
import systemRoutes from './routes/system.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '127.0.0.1';
const CLIENT_URL = process.env.CLIENT_URL || 'http://127.0.0.1:5173';

// Enhanced Production Security Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "blob:", "https:", "http:"],
        connectSrc: ["'self'", CLIENT_URL, "http://127.0.0.1:5173", "http://127.0.0.1:5000", "http://localhost:5173", "http://localhost:5000"]
      }
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xContentTypeOptions: true,
    xDnsPrefetchControl: { allow: false },
    xFrameOptions: { action: 'deny' },
    xXssProtection: true
  })
);

// Scenarios 8 & 9: Dynamic Origin Reflection with Permissive CORS Policy
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie, X-Requested-With');

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

app.use(
  cors({
    origin: (requestOrigin, callback) => {
      // Reflect any supplied origin
      callback(null, requestOrigin || true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With']
  })
);

app.use(cookieParser(process.env.COOKIE_SECRET || 'honey-juice-secret-artisanal'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global Authentication Session Context Middleware
app.use(authMiddleware);

// --- The Six Logical API Surface Groups ---
app.use('/api/auth', authRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/juices', juicesRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/system', systemRoutes);

// Production Client Static Serving
const clientDistPath = path.resolve(process.cwd(), 'client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      next();
    }
  });
});

// Centralized Error Handling
app.use(errorHandler);

// Bootstrap Server & Persistent Storage
async function bootstrap() {
  try {
    await PersistenceService.init();
    if (process.env.NODE_ENV !== 'test') {
      app.listen(Number(PORT), HOST, () => {
        console.log(`🍯 Welcome to Honey Juice Shop running at http://${HOST}:${PORT}`);
      });
    }
  } catch (error) {
    console.error('Fatal initialization error:', error);
    process.exit(1);
  }
}

bootstrap();

export default app;
