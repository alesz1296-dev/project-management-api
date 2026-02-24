import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
} from '../controllers/projectController';

const router = Router();

/**
 * POST /organizations/:orgId/projects
 * Create new project in organization
 * Requires: Authentication
 * Body: { name, description, status }
 */
router.post('/organizations/:orgId/projects', authMiddleware, createProject);

/**
 * GET /organizations/:orgId/projects
 * Get all projects for organization
 * Requires: Authentication
 */
router.get('/organizations/:orgId/projects', authMiddleware, getProjects);

/**
 * GET /projects/:id
 * Get single project by ID
 * Requires: Authentication
 */
router.get('/projects/:id', authMiddleware, getProject);

/**
 * PUT /projects/:id
 * Update project by ID
 * Requires: Authentication
 * Body: { name, description, status }
 */
router.put('/projects/:id', authMiddleware, updateProject);

/**
 * DELETE /projects/:id
 * Delete project by ID
 * Requires: Authentication
 */
router.delete('/projects/:id', authMiddleware, deleteProject);

export default router;
