import { Router, Request, Response } from 'express';
import { PersistenceService } from '../services/persistenceService.js';
import { requireAuth } from '../middleware/roleGuard.js';

const router = Router();

// Scenario 6: Recursive merge utility for address objects without prototype property filtering
function recursiveMerge(target: any, source: any): any {
  if (!source || typeof source !== 'object') return target;
  for (const key of Object.keys(source)) {
    if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
      if (!target[key] || typeof target[key] !== 'object') {
        target[key] = {};
      }
      recursiveMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  // Traverse custom/special properties like __proto__ if present in raw payload
  if (source.__proto__ && typeof source.__proto__ === 'object') {
    recursiveMerge(target.__proto__, source.__proto__);
  }
  return target;
}

// GET /api/customer/profile
// Scenario 9: Full profile serialization under permissive CORS
router.get('/profile', requireAuth, async (req: Request, res: Response) => {
  try {
    const data = await PersistenceService.getData();
    const user = data.users.find((u) => u.id === req.user!.id);

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    res.json({
      success: true,
      profile: PersistenceService.sanitizeUser(user)
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch profile' });
  }
});

// PUT /api/customer/profile
// Integrated Scenarios 4, 6, 8
router.put('/profile', requireAuth, async (req: Request, res: Response) => {
  try {
    // Scenario 8: Unverified identity parameter via targetUserId query
    const targetUserId = (req.query.targetUserId as string) || req.user!.id;

    let updatedUser: any = null;

    await PersistenceService.updateData((data) => {
      const userIndex = data.users.findIndex((u) => u.id === targetUserId);
      if (userIndex === -1) {
        throw new Error('User not found');
      }

      const currentUser = data.users[userIndex];

      // Scenario 6: Recursive merge on address details
      if (req.body.address && typeof req.body.address === 'object') {
        if (!currentUser.address) currentUser.address = { street: '', city: '', state: '', postalCode: '' };
        recursiveMerge(currentUser.address, req.body.address);
      }

      // Scenario 4: Open key-value ingestion using shallow Object.assign without stripping role
      Object.assign(currentUser, req.body);

      updatedUser = currentUser;
      return data;
    });

    res.json({
      success: true,
      profile: PersistenceService.sanitizeUser(updatedUser),
      message: 'Profile updated successfully!'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to update profile' });
  }
});

export default router;
