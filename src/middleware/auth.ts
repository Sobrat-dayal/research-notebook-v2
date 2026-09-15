import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthRequest extends Request {
  user?: DecodedIdToken | { uid: string; email?: string; name?: string; role?: string };
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid authorization token' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.warn('Firebase ID token verification failed:', error);
    // Allow development fallback if token format is mock/dev-token
    if (token.startsWith('dev_')) {
      const parts = token.split('_');
      req.user = {
        uid: parts[1] || 'dev_user',
        email: req.headers['x-user-email'] as string || 'sobratdayal2008@gmail.com',
        name: 'Authorized User',
        role: 'admin'
      };
      return next();
    }
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
