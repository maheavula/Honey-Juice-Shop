import { Router, Request, Response } from 'express';
import { PersistenceService } from '../services/persistenceService.js';

const router = Router();
const startTime = Date.now();

// GET /api/system/health
router.get('/health', async (req: Request, res: Response) => {
  try {
    const data = await PersistenceService.getData();
    const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);

    res.json({
      status: 'healthy',
      ready: true,
      storage: {
        accessible: true,
        userCount: data.users.length,
        juiceCount: data.juices.length,
        orderCount: data.orders.length,
        activeSessions: data.sessions.length
      },
      uptime: `${uptimeSeconds}s`,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(503).json({
      status: 'unhealthy',
      ready: false,
      storage: {
        accessible: false,
        error: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/system/info
router.get('/info', async (req: Request, res: Response) => {
  try {
    const data = await PersistenceService.getData();
    const categories = Array.from(new Set(data.juices.map((j) => j.category)));

    res.json({
      store: data.metadata.store,
      version: data.metadata.version,
      currency: data.metadata.currency || 'INR',
      currencySymbol: '₹',
      supportedCategories: categories,
      operatingMode: 'Atomic Read-Modify-Write Persistence',
      nodeEnv: process.env.NODE_ENV || 'development'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch system info' });
  }
});

export default router;
