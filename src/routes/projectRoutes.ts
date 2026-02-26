import { Router } from 'express';
import { environmentalAuthMiddleware } from '../middlewares/environmentalAuthMiddleware';
import { asyncHandler } from '../middlewares/errorHandler';
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

const router = Router();

/**
 * POST /organizations/:orgId/projects
 * Create new project
 */
router.post(
  '/organizations/:orgId/projects',
  environmentalAuthMiddleware,
  asyncHandler(createProject)
);

/**
 * GET /organizations/:orgId/projects
 * Get all projects in organization
 */
router.get(
  '/organizations/:orgId/projects',
  environmentalAuthMiddleware,
  asyncHandler(getProjectsByOrganization)
);

/**
 * GET /projects/:id
 * Get single project by ID
 */
router.get(
  '/projects/:id',
  environmentalAuthMiddleware,
  asyncHandler(getProject)
);

/**
 * PUT /projects/:id
 * Update project by ID
 */
router.put(
  '/projects/:id',
  environmentalAuthMiddleware,
  asyncHandler(updateProject)
);

/**
 * DELETE /projects/:id
 * Delete project by ID
 */
router.delete(
  '/projects/:id',
  environmentalAuthMiddleware,
  asyncHandler(deleteProject)
);

/**
 * GET /projects/status/:status
 * Get projects by status (ACTIVE or ARCHIVED)
 */
router.get(
  '/projects/status/:status',
  environmentalAuthMiddleware,
  asyncHandler(getProjectsByStatus)
);

/**
 * POST /projects/:projectId/members
 * Add user to project team
 * Permissions: Project ADMIN
 */
router.post(
  '/projects/:projectId/members',
  environmentalAuthMiddleware,
  asyncHandler(addProjectMember)
);

/**
 * GET /projects/:projectId/members
 * List project team members
 */
router.get(
  '/projects/:projectId/members',
  environmentalAuthMiddleware,
  asyncHandler(getProjectMembers)
);

/**
 * PUT /projects/:projectId/members/:userId
 * Update user role in project
 * Permissions: Project ADMIN
 */
router.put(
  '/projects/:projectId/members/:userId',
  environmentalAuthMiddleware,
  asyncHandler(updateProjectMemberRole)
);

/**
 * DELETE /projects/:projectId/members/:userId
 * Remove user from project
 * Permissions: Project ADMIN
 */
router.delete(
  '/projects/:projectId/members/:userId',
  environmentalAuthMiddleware,
  asyncHandler(removeProjectMember)
);

export default router;
