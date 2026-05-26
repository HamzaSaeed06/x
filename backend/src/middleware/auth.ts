import 'dotenv/config';
import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { id: string; email: string; role: string };
}

if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set. Server cannot start securely.');
  process.exit(1);
}
const JWT_SECRET = process.env.JWT_SECRET as string;

export function generateToken(payload: { id: string; email: string; role: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  let token = req.cookies?.token;
  const header = req.headers.authorization;
  if (!token && header && header.startsWith('Bearer ')) {
    token = header.slice(7);
  }

  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
    };
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }
    next();
  });
}

export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction): void {
  let token = req.cookies?.token;
  const header = req.headers.authorization;
  if (!token && header && header.startsWith('Bearer ')) {
    token = header.slice(7);
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: string;
        email: string;
        role: string;
      };
      req.user = decoded;
    } catch {}
  }
  next();
}
