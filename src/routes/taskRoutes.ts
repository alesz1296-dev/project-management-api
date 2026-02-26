import { Router } from 'express';
import { environmentalAuthMiddleware } from '../middlewares/environmentalAuthMiddleware';
import { asyncHandler } from '../middlewares/errorHandler';
import {
  createTask,
  getTasksByProject,
  getTask,
  updateTask,
  deleteTask,
  getTasksByUser,
  getMyTasks,
  getAllTasksInOrganization,
  getProjectTasksWithDetails,
} from '../controllers/taskController';

const router = Router();

/**
 * GET /organizations/:orgId/tasks/my-tasks
 * Get all tasks assigned to authenticated user
 */
router.get(
  '/organizations/:orgId/tasks/my-tasks',
  environmentalAuthMiddleware,
  asyncHandler(getMyTasks)
);

/**
 * GET /users/:userId/tasks?organizationId=<id>
 * Get all tasks assigned to a specific user
 * Permissions: User can view own tasks, leads/managers can view team
 */
router.get(
  '/users/:userId/tasks',
  environmentalAuthMiddleware,
  asyncHandler(getTasksByUser)
);

/**
 * GET /organizations/:orgId/tasks
 * Get all tasks in organization with optional filters
 * Filters: ?status=<status>&priority=<priority>&assignedTo=<userId>
 */
router.get(
  '/organizations/:orgId/tasks',
  environmentalAuthMiddleware,
  asyncHandler(getAllTasksInOrganization)
);

/**
 * POST /projects/:projectId/tasks
 * Create new task in project
 */
router.post(
  '/projects/:projectId/tasks',
  environmentalAuthMiddleware,
  asyncHandler(createTask)
);

/**
 * GET /projects/:projectId/tasks
 * Get all tasks in project with optional filters
 * Filters: ?status=<status>&priority=<priority>&assignedTo=<userId>
 */
router.get(
  '/projects/:projectId/tasks',
  environmentalAuthMiddleware,
  asyncHandler(getProjectTasksWithDetails)
);

/**
 * GET /tasks/:id
 * Get single task by ID
 */
router.get('/tasks/:id', environmentalAuthMiddleware, asyncHandler(getTask));

/**
 * PUT /tasks/:id
 * Update task by ID
 */
router.put('/tasks/:id', environmentalAuthMiddleware, asyncHandler(updateTask));

/**
 * DELETE /tasks/:id
 * Delete task by ID
 */
router.delete(
  '/tasks/:id',
  environmentalAuthMiddleware,
  asyncHandler(deleteTask)
);

export default router;
