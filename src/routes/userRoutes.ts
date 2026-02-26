import { Router } from 'express';
import { environmentalAuthMiddleware } from '../middlewares/environmentalAuthMiddleware';
import { asyncHandler } from '../middlewares/errorHandler';
import {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
} from '../controllers/userController';

const router = Router();

/**
 * POST /users/register
 * Register new user
 * Auth: Not required
 */
router.post('/register', asyncHandler(registerUser)); // async handler

/**
 * POST /users/login
 * Login user
 * Auth: Not required
 */
router.post('/login', asyncHandler(loginUser)); // async handler

/**
 * GET /users
 * Get all users
 * Auth: Required in production, optional in development
 */
router.get('/', environmentalAuthMiddleware, asyncHandler(getAllUsers));

/**
 * GET /users/:id
 * Get single user by ID
 * Auth: Required in production, optional in development
 */
router.get('/:id', environmentalAuthMiddleware, asyncHandler(getUserById));

/**
 * PUT /users/:id
 * Update user by ID
 * Auth: Required in production, optional in development
 */
router.put('/:id', environmentalAuthMiddleware, asyncHandler(updateUserById));

/**
 * DELETE /users/:id
 * Delete user by ID
 * Auth: Required in production, optional in development
 */
router.delete(
  '/:id',
  environmentalAuthMiddleware,
  asyncHandler(deleteUserById)
);

export default router;
