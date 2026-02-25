import { Router } from 'express';
import { environmentalAuthMiddleware } from '../middlewares/environmentalAuthMiddleware';
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

// ============================================
// OPTION A: Personal & Team Views
// ============================================

/**
 * GET /organizations/:orgId/tasks/my-tasks
 * Get all tasks assigned to authenticated user
 */
router.get(
  '/organizations/:orgId/tasks/my-tasks',
  environmentalAuthMiddleware,
  getMyTasks
);

/**
 * GET /users/:userId/tasks?organizationId=<id>
 * Get all tasks assigned to a specific user
 * Permissions: User can view own tasks, leads/managers can view team
 */
router.get('/users/:userId/tasks', environmentalAuthMiddleware, getTasksByUser);

// ============================================
// OPTION B: Organization-wide & Project Views
// ============================================

/**
 * GET /organizations/:orgId/tasks
 * Get all tasks in organization with optional filters
 * Filters: ?status=<status>&priority=<priority>&assignedTo=<userId>
 */
router.get(
  '/organizations/:orgId/tasks',
  environmentalAuthMiddleware,
  getAllTasksInOrganization
);

/**
 * POST /projects/:projectId/tasks
 * Create new task in project
 */
router.post(
  '/projects/:projectId/tasks',
  environmentalAuthMiddleware,
  createTask
);

/**
 * GET /projects/:projectId/tasks
 * Get all tasks in project with optional filters
 * Filters: ?status=<status>&priority=<priority>&assignedTo=<userId>
 */
router.get(
  '/projects/:projectId/tasks',
  environmentalAuthMiddleware,
  getProjectTasksWithDetails
);

/**
 * GET /tasks/:id
 * Get single task by ID
 */
router.get('/tasks/:id', environmentalAuthMiddleware, getTask);

/**
 * PUT /tasks/:id
 * Update task by ID
 */
router.put('/tasks/:id', environmentalAuthMiddleware, updateTask);

/**
 * DELETE /tasks/:id
 * Delete task by ID
 */
router.delete('/tasks/:id', environmentalAuthMiddleware, deleteTask);

export default router;
