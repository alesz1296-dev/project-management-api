import { Router } from 'express';
import { environmentalAuthMiddleware } from '../middlewares/environmentalAuthMiddleware';
import { asyncHandler } from '../middlewares/errorHandler';
import { validate } from '../middlewares/validationMiddleware';
import {
  createProject,
  getProjectsByOrganization,
  getProject,
  updateProject,
  deleteProject,
  getProjectsByStatus,
  addProjectMember,
  getProjectMembers,
  updateProjectMemberRole,
  removeProjectMember,
} from '../controllers/projectController';
import { createTask } from '../controllers/taskController';
import {
  createProjectSchema,
  updateProjectSchema,
} from '../validators/projectValidationSchemas';
import { createTaskSchema } from '../validators/taskValidationSchemas';

const router = Router();

/**
 * ============================================
 * CREATE PROJECT
 * ============================================
 * POST /api/organizations/:orgId/projects
 */
router.post(
  '/organizations/:orgId/projects',
  environmentalAuthMiddleware,
  validate(createProjectSchema),
  asyncHandler(createProject)
);

/**
 * ============================================
 * GET PROJECTS BY ORGANIZATION
 * ============================================
 * GET /api/organizations/:orgId/projects
 */
router.get(
  '/organizations/:orgId/projects',
  environmentalAuthMiddleware,
  asyncHandler(getProjectsByOrganization)
);

/**
 * ============================================
 * GET PROJECT BY ID
 * ============================================
 * GET /api/projects/:id
 */
router.get(
  '/projects/:id',
  environmentalAuthMiddleware,
  asyncHandler(getProject)
);

/**
 * ============================================
 * UPDATE PROJECT
 * ============================================
 * PUT /api/projects/:id
 */
router.put(
  '/projects/:id',
  environmentalAuthMiddleware,
  validate(updateProjectSchema),
  asyncHandler(updateProject)
);

/**
 * ============================================
 * DELETE PROJECT
 * ============================================
 * DELETE /api/projects/:id
 */
router.delete(
  '/projects/:id',
  environmentalAuthMiddleware,
  asyncHandler(deleteProject)
);

/**
 * ============================================
 * GET PROJECTS BY STATUS
 * ============================================
 * GET /api/projects/status/:status
 */
router.get(
  '/projects/status/:status',
  environmentalAuthMiddleware,
  asyncHandler(getProjectsByStatus)
);

/**
 * ============================================
 * CREATE TASK IN PROJECT
 * ============================================
 * POST /api/projects/:projectId/tasks
 */
router.post(
  '/projects/:projectId/tasks',
  environmentalAuthMiddleware,
  validate(createTaskSchema),
  asyncHandler(createTask)
);

/**
 * ============================================
 * ADD PROJECT MEMBER
 * ============================================
 * POST /api/projects/:projectId/members
 */
router.post(
  '/projects/:projectId/members',
  environmentalAuthMiddleware,
  asyncHandler(addProjectMember)
);

/**
 * ============================================
 * GET PROJECT MEMBERS
 * ============================================
 * GET /api/projects/:projectId/members
 */
router.get(
  '/projects/:projectId/members',
  environmentalAuthMiddleware,
  asyncHandler(getProjectMembers)
);

/**
 * ============================================
 * UPDATE PROJECT MEMBER ROLE
 * ============================================
 * PUT /api/projects/:projectId/members/:userId
 */
router.put(
  '/projects/:projectId/members/:userId',
  environmentalAuthMiddleware,
  asyncHandler(updateProjectMemberRole)
);

/**
 * ============================================
 * REMOVE PROJECT MEMBER
 * ============================================
 * DELETE /api/projects/:projectId/members/:userId
 */
router.delete(
  '/projects/:projectId/members/:userId',
  environmentalAuthMiddleware,
  asyncHandler(removeProjectMember)
);

export default router;
