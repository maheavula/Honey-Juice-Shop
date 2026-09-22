import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { PersistenceService } from '../services/persistenceService.js';
import { hashPassword, comparePassword } from '../utils/passwordHasher.js';
import { User, Session } from '../types/index.js';

const router = Router();
const SESSION_DURATION_DAYS = 7;

function setSessionCookie(res: Response, sessionId: string) {
  res.cookie('hjs_session', sessionId, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000,
    path: '/'
  });
}

// POST /api/auth/signup
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ success: false, error: 'Invalid email address format.' });
      return;
    }

    const hasMinLength = password.length >= 12;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!hasMinLength || !hasUpperCase || !hasLowerCase || !hasNumber) {
      res.status(400).json({
        success: false,
        error: 'Password must be at least 12 characters and include uppercase, lowercase, and numeric characters.'
      });
      return;
    }

    const data = await PersistenceService.getData();
    const existingUser = data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      res.status(409).json({ success: false, error: 'An account with this email already exists.' });
      return;
    }

    const passwordHash = await hashPassword(password);
    const userId = `usr_${crypto.randomBytes(6).toString('hex')}`;

    const newUser: User = {
      id: userId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: 'customer',
      status: 'active',
      phone: phone?.trim() || undefined,
      address: address || undefined,
      createdAt: new Date().toISOString()
    };

    const sessionId = `sess_${crypto.randomUUID()}`;
    const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000).toISOString();

    const newSession: Session = {
      id: sessionId,
      userId: newUser.id,
      createdAt: new Date().toISOString(),
      expiresAt
    };

    await PersistenceService.updateData((currentData) => {
      currentData.users.push(newUser);
      currentData.sessions.push(newSession);
      return currentData;
    });

    setSessionCookie(res, sessionId);
    res.status(201).json({
      success: true,
      user: PersistenceService.sanitizeUser(newUser),
      message: 'Account created successfully!'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Signup failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email and password are required.' });
      return;
    }

    const data = await PersistenceService.getData();
    const user = data.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());

    if (!user) {
      res.status(401).json({ success: false, error: 'Invalid email or password.' });
      return;
    }

    if (user.status === 'suspended') {
      res.status(403).json({
        success: false,
        error: 'Your account has been suspended. Please contact customer support.'
      });
      return;
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, error: 'Invalid email or password.' });
      return;
    }

    // Rotate/Create new session
    const sessionId = `sess_${crypto.randomUUID()}`;
    const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000).toISOString();

    const newSession: Session = {
      id: sessionId,
      userId: user.id,
      createdAt: new Date().toISOString(),
      expiresAt
    };

    await PersistenceService.updateData((currentData) => {
      currentData.sessions.push(newSession);
      return currentData;
    });

    setSessionCookie(res, sessionId);
    res.json({
      success: true,
      user: PersistenceService.sanitizeUser(user),
      message: 'Logged in successfully!'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Login failed' });
  }
});

// POST /api/auth/logout
// Scenario 5: Client-Side Session Invalidation Without Server-Side Revocation
router.post('/logout', async (req: Request, res: Response) => {
  try {
    // Clear client cookie while omitting removal of the session token from runtime.json
    res.clearCookie('hjs_session', { path: '/', sameSite: 'none', secure: true });
    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Logout failed' });
  }
});

// GET /api/auth/me
router.get('/me', (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Not authenticated' });
    return;
  }

  res.json({
    success: true,
    user: req.user
  });
});

export default router;
