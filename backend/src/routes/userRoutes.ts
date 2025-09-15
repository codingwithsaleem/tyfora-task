import express from 'express';
import { registerUser, loginUser } from '../controllers/userController';
import { validateFields, validateEmail, validatePassword } from '../middleware/validationMiddleware';

const router = express.Router();

/**
 * User registration request
 * @typedef {object} UserRegisterRequest
 * @property {string} name.required - User's full name
 * @property {string} email.required - User's email
 * @property {string} password.required - User's password
 * @property {string} role - User's role (admin or member) - enum:admin,member
 */

/**
 * User response with token
 * @typedef {object} UserResponse
 * @property {string} _id - User ID
 * @property {string} name - User's full name
 * @property {string} email - User's email
 * @property {string} role - User's role
 * @property {string} token - JWT token
 */

/**
 * User login request
 * @typedef {object} UserLoginRequest
 * @property {string} email.required - User's email
 * @property {string} password.required - User's password
 */

/**
 * POST /users/register
 * @tags Users
 * @summary Register a new user
 * @param {UserRegisterRequest} request.body.required - User registration data
 * @return {UserResponse} 201 - Successful registration
 * @return {object} 400 - Bad request
 */
router.post(
  '/register',
  validateFields(['name', 'email', 'password']),
  validateEmail,
  validatePassword,
  registerUser
);

/**
 * POST /users/login
 * @tags Users
 * @summary Authenticate user & get token
 * @param {UserLoginRequest} request.body.required - User login data
 * @return {UserResponse} 200 - Successful login
 * @return {object} 401 - Unauthorized
 */
router.post(
  '/login',
  validateFields(['email', 'password']),
  validateEmail,
  loginUser
);

export default router;