import { Router } from 'express';
import { environmentalAuthMiddleware } from '../middlewares/environmentalAuthMiddleware';
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
  createProject
);

/**
 * GET /organizations/:orgId/projects
 * Get all projects in organization
 */
router.get(
  '/organizations/:orgId/projects',
  environmentalAuthMiddleware,
  getProjectsByOrganization
);

/**
 * GET /projects/:id
 * Get single project by ID
 */
router.get('/projects/:id', environmentalAuthMiddleware, getProject);

/**
 * PUT /projects/:id
 * Update project by ID
 */
router.put('/projects/:id', environmentalAuthMiddleware, updateProject);

/**
 * DELETE /projects/:id
 * Delete project by ID
 */
router.delete('/projects/:id', environmentalAuthMiddleware, deleteProject);

/**
 * GET /projects/status/:status
 * Get projects by status (ACTIVE or ARCHIVED)
 */
router.get(
  '/projects/status/:status',
  environmentalAuthMiddleware,
  getProjectsByStatus
);

/**
 * POST /projects/:projectId/members
 * Add user to project team
 * Permissions: Project ADMIN
 */
router.post(
  '/projects/:projectId/members',
  environmentalAuthMiddleware,
  addProjectMember
);

/**
 * GET /projects/:projectId/members
 * List project team members
 */
router.get(
  '/projects/:projectId/members',
  environmentalAuthMiddleware,
  getProjectMembers
);

/**
 * PUT /projects/:projectId/members/:userId
 * Update user role in project
 * Permissions: Project ADMIN
 */
router.put(
  '/projects/:projectId/members/:userId',
  environmentalAuthMiddleware,
  updateProjectMemberRole
);

/**
 * DELETE /projects/:projectId/members/:userId
 * Remove user from project
 * Permissions: Project ADMIN
 */
router.delete(
  '/projects/:projectId/members/:userId',
  environmentalAuthMiddleware,
  removeProjectMember
);

export default router;
