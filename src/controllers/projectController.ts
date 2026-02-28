import { Request, Response } from 'express';
import { ProjectService } from '../services/projectService';

/**
 * ============================================
 * CREATE PROJECT
 * ============================================
 */
export const createProject = async (req: Request, res: Response) => {
  const orgId = parseInt(req.params.orgId);
  const userId = (req.user as any).id;
  const { name, description } = req.body;

  const project = await ProjectService.createProject(orgId, userId, {
    name,
    description,
  });

  res.status(201).json({
    success: true,
    message: 'Project created successfully.',
    data: project,
  });
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
  const orgId = parseInt(req.params.orgId);

  const projects = await ProjectService.getProjects(orgId);

  res.status(200).json({
    success: true,
    message: 'Projects retrieved successfully.',
    data: projects,
  });
};

/**
 * ============================================
 * GET PROJECT BY ID
 * ============================================
 */
export const getProject = async (req: Request, res: Response) => {
  const projectId = parseInt(req.params.id);

  const project = await ProjectService.getProject(projectId);

  res.status(200).json({
    success: true,
    message: 'Project retrieved successfully.',
    data: project,
  });
};

/**
 * ============================================
 * UPDATE PROJECT
 * ============================================
 */
export const updateProject = async (req: Request, res: Response) => {
  const projectId = parseInt(req.params.id);
  const userId = (req.user as any).id;
  const { name, description, status } = req.body;

  const updatedProject = await ProjectService.updateProject(projectId, userId, {
    name,
    description,
    status,
  });

  res.status(200).json({
    success: true,
    message: 'Project updated successfully.',
    data: updatedProject,
  });
};

/**
 * ============================================
 * DELETE PROJECT
 * ============================================
 */
export const deleteProject = async (req: Request, res: Response) => {
  const projectId = parseInt(req.params.id);
  const userId = (req.user as any).id;

  const result = await ProjectService.deleteProject(projectId, userId);

  res.status(200).json({
    success: true,
    message: result.message,
  });
};

/**
 * ============================================
 * GET PROJECTS BY STATUS
 * ============================================
 */
export const getProjectsByStatus = async (req: Request, res: Response) => {
  const status = req.params.status as 'ACTIVE' | 'ARCHIVED';

  const projects = await ProjectService.getProjectsByStatus(status);

  res.status(200).json({
    success: true,
    message: 'Projects retrieved successfully.',
    data: projects,
  });
};

/**
 * ============================================
 * ADD PROJECT MEMBER
 * ============================================
 */
export const addProjectMember = async (req: Request, res: Response) => {
  const projectId = parseInt(req.params.projectId);
  const requestingUserId = (req.user as any).id;
  const { userId, role } = req.body;

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
};

/**
 * ============================================
 * GET PROJECT MEMBERS
 * ============================================
 */
export const getProjectMembers = async (req: Request, res: Response) => {
  const projectId = parseInt(req.params.projectId);

  const members = await ProjectService.getProjectMembers(projectId);

  res.status(200).json({
    success: true,
    message: 'Project members retrieved successfully.',
    data: members,
  });
};

/**
 * ============================================
 * UPDATE PROJECT MEMBER ROLE
 * ============================================
 */
export const updateProjectMemberRole = async (req: Request, res: Response) => {
  const projectId = parseInt(req.params.projectId);
  const userId = parseInt(req.params.userId);
  const requestingUserId = (req.user as any).id;
  const { role } = req.body;

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
};

/**
 * ============================================
 * REMOVE PROJECT MEMBER
 * ============================================
 */
export const removeProjectMember = async (req: Request, res: Response) => {
  const projectId = parseInt(req.params.projectId);
  const userId = parseInt(req.params.userId);
  const requestingUserId = (req.user as any).id;

  const result = await ProjectService.removeProjectMember(
    projectId,
    userId,
    requestingUserId
  );

  res.status(200).json({
    success: true,
    message: result.message,
  });
};
