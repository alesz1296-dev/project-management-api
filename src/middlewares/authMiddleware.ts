import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/auth';

/**
 * authMiddlewares
 * Checks if incoming requests has valid token (protection rules)
 */

/**
 * Add user property to Express Request
 * This lets us access req.user in controllers
 */
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload; // Will contain { id, email }
    }
  }
}

/**
 * Middleware that checks if request has valid JWT token
 *
 * Flow:
 * 1. Extract token from Authorization header
 * 2. Verify token signature
 * 3. If valid, attach user to request
 * 4. If invalid, reject request
 *
 * Usage:
 * router.get('/protected', authMiddleware, (req, res) => {
 *   // req.user is now available
 *   console.log(req.user.id)  // User ID
 * })
 */
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get Authorization header
    // Expected format: "Bearer eyJhbGciOiJIUzI1NiIs..."
    const authHeader = req.headers.authorization;

    // Check header exists and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res
        .status(401)
        .json({ error: 'Missing or invalid authorization header' });
    }

    // Extract token (remove "Bearer " prefix)
    const token = authHeader.substring(7); // Remove first 7 chars ("Bearer ")

    // Verify token is valid and not expired
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    // Attach user to request object
    req.user = payload;

    // Continue to next middleware/controller
    next();
  } catch (error) {
    // Token invalid or expired
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
