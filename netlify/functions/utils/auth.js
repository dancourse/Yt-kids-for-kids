// Authentication utilities for Netlify Functions
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';

// Hash a password
export function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

// Verify a password against a hash
export function verifyPassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

// Generate JWT token
export function generateToken(payload, expiresIn = '24h') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

// Verify JWT token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Extract token from request headers
export function extractToken(event) {
  const authHeader = event.headers['authorization'] || event.headers['Authorization'];
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;

  return parts[1];
}

// Middleware to require authentication
export function requireAuth(event, requiredRole = null) {
  const token = extractToken(event);
  if (!token) {
    throw new Error('Authentication required');
  }

  const payload = verifyToken(token);
  if (!payload) {
    throw new Error('Invalid or expired token');
  }

  if (requiredRole && payload.role !== requiredRole) {
    throw new Error('Insufficient permissions');
  }

  return payload;
}

// Middleware to require parent authentication
export function requireParentAuth(event) {
  return requireAuth(event, 'parent');
}

// Middleware to require kid authentication for specific profile
export function requireKidAuth(event, profileId) {
  const payload = requireAuth(event, 'kid');
  if (payload.profileId !== profileId) {
    throw new Error('Unauthorized access to this profile');
  }
  return payload;
}
