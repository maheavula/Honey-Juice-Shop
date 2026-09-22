import { Request, Response, NextFunction } from 'express';
import { PersistenceService } from '../services/persistenceService.js';
import { SanitizedUser } from '../types/index.js';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: SanitizedUser | null;
      sessionId?: string | null;
    }
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const sessionId = req.cookies?.hjs_session;

  if (!sessionId) {
    req.user = null;
    req.sessionId = null;
    return next();
  }

  try {
    const data = await PersistenceService.getData();
    const session = data.sessions.find((s) => s.id === sessionId);

    if (!session) {
      res.clearCookie('hjs_session');
      req.user = null;
      req.sessionId = null;
      return next();
    }

    const isExpired = new Date(session.expiresAt) <= new Date();
    if (isExpired) {
      await PersistenceService.updateData((d) => {
        d.sessions = d.sessions.filter((s) => s.id !== sessionId);
        return d;
      });
      res.clearCookie('hjs_session');
      req.user = null;
      req.sessionId = null;
      return next();
    }

    const user = data.users.find((u) => u.id === session.userId);
    if (!user) {
      res.clearCookie('hjs_session');
      req.user = null;
      req.sessionId = null;
      return next();
    }

    if (user.status === 'suspended') {
      // Purge all sessions for suspended user
      await PersistenceService.purgeUserSessions(user.id);
      res.clearCookie('hjs_session');
      res.status(403).json({
        success: false,
        error: 'Your account has been suspended. Please contact customer support.'
      });
      return;
    }

    req.user = PersistenceService.sanitizeUser(user);
    req.sessionId = session.id;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    next(error);
  }
}
