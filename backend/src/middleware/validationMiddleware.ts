import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorMiddleware';

/**
 * Validate required fields in request body
 * @param fields - Array of field names to validate
 */
export const validateFields = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const missingFields = fields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return next(
        new AppError(
          `Missing required fields: ${missingFields.join(', ')}`,
          400
        )
      );
    }
    
    next();
  };
};

/**
 * Validate email format
 */
export const validateEmail = (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;
  
  if (email && !/^\S+@\S+\.\S+$/.test(email)) {
    return next(new AppError('Invalid email format', 400));
  }
  
  next();
};

/**
 * Validate password strength
 * Password must be at least 6 characters long
 */
export const validatePassword = (req: Request, res: Response, next: NextFunction) => {
  const { password } = req.body;
  
  if (password && password.length < 6) {
    return next(new AppError('Password must be at least 6 characters long', 400));
  }
  
  next();
};