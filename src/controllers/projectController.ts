import { Request, Response } from 'express';
import { ProjectService } from '../services/projectService';

/**
 * ============================================
 * VALIDATION HELPERS (DRY)
 * ============================================
 */

const validateOrgId = (id: string, res: Response): number | null => {
  const orgId = parseInt(id);
  if (isNaN(orgId)) {
    res.status(400).json({
      success: false,
      message: 'Invalid organization ID. Must be a number.',
    });
    return null;
  }
  return orgId;
};

const validateProjectId = (id: string, res: Response): number | null => {
  const projectId = parseInt(id);
  if (isNaN(projectId)) {
    res.status(400).json({
      success: false,
      message: 'Invalid project ID. Must be a number.',
    });
    return null;
  }
  return projectId;
};

const validateProjectStatus = (
  status: string,
  res: Response
): 'ACTIVE' | 'ARCHIVED' | null => {
  const validStatuses = ['ACTIVE', 'ARCHIVED'];
  if (!validStatuses.includes(status)) {
    res.status(400).json({
      success: false,
      message: 'Invalid project status. Must be ACTIVE or ARCHIVED.',
    });
    return null;
  }
  return status as 'ACTIVE' | 'ARCHIVED';
};

/**
 * ============================================
 * CREATE PROJECT
 * ============================================
 */
export const createProject = async (req: Request, res: Response) => {
  try {
    // Validate organization ID
    const orgId = validateOrgId(req.params.id, res);
    if (orgId === null) return;

    // Get authenticated user
    const userId = (req.user as any).id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. User not authenticated.',
      });
    }

    // Get project data from request body
    const { name, description } = req.body;

    // Validate name is provided
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Project name is required.',
      });
    }

    // Call service to create project
    const project = await ProjectService.createProject(orgId, userId, {
      name,
      description,
    });

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Project created successfully.',
      data: project,
    });
  } catch (error: any) {
    const statusCode = error.message.includes('not found') ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to create project.',
    });
  }
};

/**
 * ============================================
 * GET PROJECTS BY ORGANIZATION
 * ============================================
 */
export const getProjects = async (req: Request, res: Response) => {
  try {
    // Validate organization ID
    const orgId = validateOrgId(req.params.id, res);
    if (orgId === null) return;

    // Call service to get projects
    const projects = await ProjectService.getProjects(orgId);

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Projects retrieved successfully.',
      data: projects,
    });
  } catch (error: any) {
    const statusCode = error.message.includes('not found') ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to retrieve projects.',
    });
  }
};

/**
 * ============================================
 * GET PROJECT BY ID
 * ============================================
 */
export const getProject = async (req: Request, res: Response) => {
  try {
    // Validate project ID
    const projectId = validateProjectId(req.params.id, res);
    if (projectId === null) return;

    // Call service to get project
    const project = await ProjectService.getProject(projectId);

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Project retrieved successfully.',
      data: project,
    });
  } catch (error: any) {
    const statusCode = error.message.includes('not found') ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to retrieve project.',
    });
  }
};

/**
 * ============================================
 * UPDATE PROJECT
 * ============================================
 */
export const updateProject = async (req: Request, res: Response) => {
  try {
    // Validate project ID
    const projectId = validateProjectId(req.params.id, res);
    if (projectId === null) return;

    // Get authenticated user
    const userId = (req.user as any).id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. User not authenticated.',
      });
    }

    // Get update data from request body
    const { name, description, status } = req.body;

    // Validate at least one field is provided
    if (!name && !description && !status) {
      return res.status(400).json({
        success: false,
        message: 'At least one field is required to update.',
      });
    }

    // Validate status if provided
    let validStatus: 'ACTIVE' | 'ARCHIVED' | undefined | null = undefined;
    if (status) {
      validStatus = validateProjectStatus(status, res);
      if (validStatus === null) return;
    }

    // Call service to update project
    const updatedProject = await ProjectService.updateProject(
      projectId,
      userId,
      {
        name,
        description,
        status: validStatus,
      }
    );

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Project updated successfully.',
      data: updatedProject,
    });
  } catch (error: any) {
    const statusCode = error.message.includes('not found') ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to update project.',
    });
  }
};

/**
 * ============================================
 * DELETE PROJECT
 * ============================================
 */
export const deleteProject = async (req: Request, res: Response) => {
  try {
    // Validate project ID
    const projectId = validateProjectId(req.params.id, res);
    if (projectId === null) return;

    // Get authenticated user
    const userId = (req.user as any).id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. User not authenticated.',
      });
    }

    // Call service to delete project
    const result = await ProjectService.deleteProject(projectId, userId);

    // Return success response
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    const statusCode = error.message.includes('not found') ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to delete project.',
    });
  }
};
