import { Request, Response, NextFunction } from 'express';
import admin from '../config/firebase';
import { AuthService } from '../services/AuthService';

interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email: string;
    name?: string;
  };
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Sync user with our database
    const user = await AuthService.syncUser(decodedToken);

    req.user = {
      uid: user.firebase_uid,
      email: user.email,
      name: user.display_name || undefined,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};
