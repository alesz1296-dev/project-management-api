import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  getMyTasks,
  getTasksByAssignee,
} from '../controllers/taskController';

const router = Router();

/**
 * POST /projects/:projectId/tasks
 * Create new task in project
 * Requires: Authentication
 * Body: { title, description, status, priority, assignedTo, dueDate }
 */
router.post('/projects/:projectId/tasks', authMiddleware, createTask);

/**
 * GET /projects/:projectId/tasks
 * Get all tasks for project
 * Requires: Authentication
 * Query: ?status=TODO&priority=HIGH&assignedTo=5
 */
router.get('/projects/:projectId/tasks', authMiddleware, getTasks);

/**
 * GET /tasks/:id
 * Get single task by ID
 * Requires: Authentication
 */
router.get('/tasks/:id', authMiddleware, getTask);

/**
 * PUT /tasks/:id
 * Update task by ID
 * Requires: Authentication
 * Body: { title, description, status, priority, assignedTo, dueDate }
 */
router.put('/tasks/:id', authMiddleware, updateTask);

/**
 * DELETE /tasks/:id
 * Delete task by ID
 * Requires: Authentication
 */
router.delete('/tasks/:id', authMiddleware, deleteTask);

/**
 * GET /organizations/:orgId/tasks/my-tasks
 * Get all tasks assigned to authenticated user in organization
 * Requires: Authentication
 */
router.get('/organizations/:orgId/tasks/my-tasks', authMiddleware, getMyTasks);

/**
 * GET /users/:userId/tasks
 * Get all tasks assigned to specific user
 * Requires: Authentication
 */
router.get('/users/:userId/tasks', authMiddleware, getTasksByAssignee);

export default router;
