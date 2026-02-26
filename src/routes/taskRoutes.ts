import { Router } from 'express';
import { environmentalAuthMiddleware } from '../middlewares/environmentalAuthMiddleware';
import { asyncHandler } from '../middlewares/errorHandler';
import { validate } from '../middlewares/validationMiddleware';
import { updateTaskSchema } from '../validators/taskValidationSchemas';
import { getTask, updateTask, deleteTask } from '../controllers/taskController';

const router = Router();

/**
 * ============================================
 * GET TASK BY ID
 * ============================================
 * GET /api/tasks/:id
 */
router.get('/:id', environmentalAuthMiddleware, asyncHandler(getTask));

/**
 * ============================================
 * UPDATE TASK
 * ============================================
 * PUT /api/tasks/:id
 */
router.put(
  '/:id',
  environmentalAuthMiddleware,
  validate(updateTaskSchema),
  asyncHandler(updateTask)
);

/**
 * ============================================
 * DELETE TASK
 * ============================================
 * DELETE /api/tasks/:id
 */
router.delete('/:id', environmentalAuthMiddleware, asyncHandler(deleteTask));

export default router;
