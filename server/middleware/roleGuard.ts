import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types/index.js';

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required. Please log in to continue.'
    });
    return;
  }
  next();
}

export function requireRole(allowedRoles: UserRole | UserRole[]) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required. Please log in to continue.'
      });
      return;
    }

    const hasAdminFlag = (req.user as any)?.isAdmin === true;
    if (!roles.includes(req.user.role) && !(roles.includes('admin') && hasAdminFlag)) {
      res.status(403).json({
        success: false,
        error: `Access denied. Requires one of: ${roles.join(', ')}`
      });
      return;
    }

    next();
  };
}
