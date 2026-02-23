import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
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
 * Requires: Authentication
 */
router.get('/', authMiddleware, getAllUsers);

/**
 * GET /users/:id
 * Get single user by ID
 * Requires: Authentication
 */
router.get('/:id', authMiddleware, getUserById);

/**
 * PUT /users/:id
 * Update user by ID
 * Requires: Authentication
 */
router.put('/:id', authMiddleware, updateUserById);

/**
 * DELETE /users/:id
 * Delete user by ID
 * Requires: Authentication
 */
router.delete('/:id', authMiddleware, deleteUserById);

export default router;
