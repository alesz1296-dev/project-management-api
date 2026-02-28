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
import { authLimiterTokenBucket } from '../middlewares/rateLimiter';
import { asyncHandler } from '../middlewares/errorHandler'; // Import asyncHandler

const router = Router();

// Public routes (wrapped with asyncHandler to catch errors)
router.post(
  '/register',
  authLimiterTokenBucket,
  validate(registerUserSchema),
  asyncHandler(registerUser)
);
router.post(
  '/login',
  authLimiterTokenBucket,
  validate(loginUserSchema),
  asyncHandler(loginUser)
);
router.post('/refresh', asyncHandler(refreshAccessToken));
router.post('/logout', asyncHandler(logoutUser));

// Protected routes (wrapped with asyncHandler)
router.post('/logout-all', authenticate, asyncHandler(logoutAllDevices));
router.get('/', authenticate, asyncHandler(getAllUsers));
router.get('/:id', authenticate, asyncHandler(getUserById));
router.put(
  '/:id',
  authenticate,
  validate(updateUserSchema),
  asyncHandler(updateUserById)
);
router.delete('/:id', authenticate, asyncHandler(deleteUserById));

export default router;
