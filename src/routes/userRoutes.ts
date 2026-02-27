import { Router } from 'express';
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  logoutAllDevices,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
} from '../controllers/userController';
import { validate } from '../middlewares/validationMiddleware';
import {
  registerUserSchema,
  loginUserSchema,
  updateUserSchema,
} from '../validators/userValidationSchemas';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

// Public routes
router.post('/register', validate(registerUserSchema), registerUser);
router.post('/login', validate(loginUserSchema), loginUser);
router.post('/refresh', refreshAccessToken);
router.post('/logout', logoutUser);

// Protected routes
router.post('/logout-all', authenticate, logoutAllDevices);
router.get('/', authenticate, getAllUsers);
router.get('/:id', authenticate, getUserById);
router.put('/:id', authenticate, validate(updateUserSchema), updateUserById);
router.delete('/:id', authenticate, deleteUserById);

export default router;
