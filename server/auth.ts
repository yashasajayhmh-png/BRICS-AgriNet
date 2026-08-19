import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { FarmerProfile } from '../src/types';

export interface AuthUser {
  id: string;
  farmerName: string;
  phoneOrEmail: string;
  country: string;
  region: string;
  role: 'farmer' | 'extension_officer' | 'admin' | 'researcher';
  plotId?: string;
  flag?: string;
}

// Augment Express Request interface with authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      authToken?: string;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'brics-agrinet-secret-key-production-change-me';
const TOKEN_EXPIRY = '7d';

/**
 * Generate a cryptographically signed JWT for an authenticated farmer or officer
 */
export function generateToken(farmer: FarmerProfile | AuthUser): string {
  const payload: AuthUser = {
    id: farmer.id,
    farmerName: farmer.farmerName,
    phoneOrEmail: farmer.phoneOrEmail,
    country: farmer.country,
    region: farmer.region,
    role: (farmer.role as any) || 'farmer',
    plotId: farmer.plotId,
    flag: farmer.flag,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
    issuer: 'brics-agrinet-auth-service',
    audience: 'brics-agrinet-app',
  });
}

/**
 * Verify and decode an incoming JWT string
 */
export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'brics-agrinet-auth-service',
      audience: 'brics-agrinet-app',
    }) as AuthUser;
    return decoded;
  } catch (err) {
    return null;
  }
}

/**
 * Extract token from standard headers, cookies, or query params
 */
export function extractTokenFromRequest(req: Request): string | null {
  // 1. Authorization: Bearer <token>
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  // 2. Cookie: agrinet_token
  if (req.cookies && req.cookies.agrinet_token) {
    return req.cookies.agrinet_token;
  }

  // 3. Query param: ?token=... (supports SSE EventSource streams)
  if (req.query && typeof req.query.token === 'string' && req.query.token.length > 0) {
    return req.query.token;
  }

  // 4. Custom x-access-token header
  const customHeader = req.headers['x-access-token'];
  if (typeof customHeader === 'string' && customHeader.length > 0) {
    return customHeader;
  }

  return null;
}

/**
 * Authentication Middleware: Enforces valid JWT token on protected routes
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractTokenFromRequest(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      code: 'UNAUTHORIZED',
      error: 'Authentication required. Please provide a valid JSON Web Token (JWT) in Authorization: Bearer <token> header or session cookie.',
    });
  }

  const user = verifyToken(token);
  if (!user) {
    return res.status(401).json({
      success: false,
      code: 'INVALID_TOKEN',
      error: 'The provided authentication token is invalid or has expired. Please sign in again.',
    });
  }

  req.user = user;
  req.authToken = token;
  next();
}

/**
 * Authorization Middleware: Role-Based Access Control (RBAC)
 */
export function requireRole(...allowedRoles: Array<'farmer' | 'extension_officer' | 'admin' | 'researcher'>) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        code: 'UNAUTHORIZED',
        error: 'Authentication is required before role authorization can be evaluated.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        code: 'FORBIDDEN',
        error: `Access denied. Role '${req.user.role}' is not authorized to perform this operation. Required: ${allowedRoles.join(', ')}`,
        currentRole: req.user.role,
        requiredRoles: allowedRoles,
      });
    }

    next();
  };
}

/**
 * Optional Auth Middleware: Attaches user if token is present and valid, otherwise proceeds anonymously
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = extractTokenFromRequest(req);
  if (token) {
    const user = verifyToken(token);
    if (user) {
      req.user = user;
      req.authToken = token;
    }
  }
  next();
}
