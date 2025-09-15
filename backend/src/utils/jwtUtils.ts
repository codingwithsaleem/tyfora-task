import jwt, { SignOptions } from 'jsonwebtoken';
import { Types } from 'mongoose';

/**
 * Generate a JWT token for user authentication
 * @param userId - User ID to encode in token
 * @returns JWT token string
 */
export const generateToken = (userId: string | Types.ObjectId): string => {
  const secret = process.env.JWT_SECRET || 'fallback_secret';
  const expiresIn = process.env.JWT_EXPIRES_IN || '30d';
  const signOptions: SignOptions = { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] };
  
  return jwt.sign({ id: userId.toString() }, secret, signOptions);
};