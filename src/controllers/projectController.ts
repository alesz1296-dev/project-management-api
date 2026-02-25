import { Request, Response } from 'express';
import { ProjectService } from '../services/projectService';

/**
 * ============================================
 * HELPER FUNCTIONS
 * ============================================
 */

const getAuthenticatedUser = (req: Request, res: Response): number | null => {
  const userId = (req.user as any).id;
  if (!userId) {
    res.status(401).json({
      success: false,
      message: 'Unauthorized. User not authenticated.',
    });
    return null;
  }
  return userId;
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

const getErrorStatusCode = (error: any): number => {
  if (error.message.includes('not found')) return 404;
  if (error.message.includes('Unauthorized')) return 403;
  return 400;
};

/**
 * ============================================
 * CREATE PROJECT
 * ============================================
 */
export const createProject = async (req: Request, res: Response) => {
  try {
    // Validate organization ID
    const orgId = validateOrgId(req.params.orgId, res);
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
export const getProjectsByOrganization = async (
  req: Request,
  res: Response
) => {
  try {
    // Validate organization ID
    const orgId = validateOrgId(req.params.orgId, res);
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
    let validStatus: 'ACTIVE' | 'ARCHIVED' | null | undefined = undefined;
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

/**
 * ============================================
 * GET PROJECTS BY STATUS
 * ============================================
 */
export const getProjectsByStatus = async (req: Request, res: Response) => {
  try {
    // Validate status
    const status = validateProjectStatus(req.params.status, res);
    if (status === null) return;

    // Call service to get projects by status
    const projects = await ProjectService.getProjectsByStatus(status);

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
 * ADD PROJECT MEMBER
 * ============================================
 * Add user to project team
 * Permissions: Project ADMIN only
 */
export const addProjectMember = async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.projectId);
    if (isNaN(projectId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID. Must be a number.',
      });
    }

    const userId = parseInt(req.body.userId);
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID. Must be a number.',
      });
    }

    const role = req.body.role;
    if (!['ADMIN', 'LEAD', 'MEMBER', 'VIEWER'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be ADMIN, LEAD, MEMBER, or VIEWER.',
      });
    }

    const requestingUserId = (req.user as any).id;
    if (!requestingUserId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. User not authenticated.',
      });
    }

    const projectMember = await ProjectService.addProjectMember(
      projectId,
      userId,
      role,
      requestingUserId
    );

    res.status(201).json({
      success: true,
      message: 'User added to project successfully.',
      data: projectMember,
    });
  } catch (error: any) {
    const statusCode = error.message.includes('not found') ? 404 : 403;

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to add user to project.',
    });
  }
};

/**
 * ============================================
 * GET PROJECT MEMBERS
 * ============================================
 * List all members in a project
 */
export const getProjectMembers = async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.projectId);
    if (isNaN(projectId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID. Must be a number.',
      });
    }

    const members = await ProjectService.getProjectMembers(projectId);

    res.status(200).json({
      success: true,
      message: 'Project members retrieved successfully.',
      data: members,
    });
  } catch (error: any) {
    const statusCode = error.message.includes('not found') ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to retrieve project members.',
    });
  }
};

/**
 * ============================================
 * UPDATE PROJECT MEMBER ROLE
 * ============================================
 * Change user's role in project
 * Permissions: Project ADMIN only
 */
export const updateProjectMemberRole = async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.projectId);
    if (isNaN(projectId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID. Must be a number.',
      });
    }

    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID. Must be a number.',
      });
    }

    const role = req.body.role;
    if (!['ADMIN', 'LEAD', 'MEMBER', 'VIEWER'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be ADMIN, LEAD, MEMBER, or VIEWER.',
      });
    }

    const requestingUserId = (req.user as any).id;
    if (!requestingUserId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. User not authenticated.',
      });
    }

    const updatedMember = await ProjectService.updateProjectMemberRole(
      projectId,
      userId,
      role,
      requestingUserId
    );

    res.status(200).json({
      success: true,
      message: 'Project member role updated successfully.',
      data: updatedMember,
    });
  } catch (error: any) {
    const statusCode = error.message.includes('not found') ? 404 : 403;

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to update project member role.',
    });
  }
};

/**
 * ============================================
 * REMOVE PROJECT MEMBER
 * ============================================
 * Remove user from project
 * Permissions: Project ADMIN only
 */
export const removeProjectMember = async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.projectId);
    if (isNaN(projectId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project ID. Must be a number.',
      });
    }

    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID. Must be a number.',
      });
    }

    const requestingUserId = (req.user as any).id;
    if (!requestingUserId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. User not authenticated.',
      });
    }

    const result = await ProjectService.removeProjectMember(
      projectId,
      userId,
      requestingUserId
    );

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    const statusCode = error.message.includes('not found') ? 404 : 403;

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to remove project member.',
    });
  }
};
