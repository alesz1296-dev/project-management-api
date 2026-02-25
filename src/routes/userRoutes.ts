import { Router } from 'express';
import { environmentalAuthMiddleware } from '../middlewares/environmentalAuthMiddleware';
import {
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
} from '../controllers/userController';

const router = Router();

/**
 * GET /users
 * Get all users
 * Auth: Required in production, optional in development
 */
router.get('/', environmentalAuthMiddleware, getAllUsers);

/**
 * GET /users/:id
 * Get single user by ID
 * Auth: Required in production, optional in development
 */
router.get('/:id', environmentalAuthMiddleware, getUserById);

/**
 * PUT /users/:id
 * Update user by ID
 * Auth: Required in production, optional in development
 */
router.put('/:id', environmentalAuthMiddleware, updateUserById);

/**
 * DELETE /users/:id
 * Delete user by ID
 * Auth: Required in production, optional in development
 */
router.delete('/:id', environmentalAuthMiddleware, deleteUserById);

export default router;
