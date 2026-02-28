import { Request, Response } from 'express';
import { TaskService } from '../services/taskService';

/**
 * ============================================
 * CREATE TASK
 * ============================================
 */
export const createTask = async (req: Request, res: Response) => {
  const projectId = parseInt(req.params.projectId);
  const userId = (req.user as any).id as number;
  const { title, description, priority, assignedTo, dueDate } = req.body;

  const task = await TaskService.createTask(projectId, userId, {
    title,
    description,
    priority,
    assignedTo,
    dueDate,
  });

  res.status(201).json({
    success: true,
    message: 'Task created successfully.',
    data: task,
  });
};

/**
 * ============================================
 * GET TASKS BY PROJECT
 * ============================================
 */
export const getTasksByProject = async (req: Request, res: Response) => {
  const projectId = parseInt(req.params.projectId);
  const userId = (req.user as any).id as number;
  const { status, priority, assignedTo } = req.query;

  const tasks = await TaskService.getTasks(projectId, userId, {
    status: status ? (status as string) : undefined,
    priority: priority ? (priority as string) : undefined,
    assignedTo: assignedTo ? parseInt(assignedTo as string) : undefined,
  });

  res.status(200).json({
    success: true,
    message: 'Tasks retrieved successfully.',
    data: tasks,
  });
};

/**
 * ============================================
 * GET TASK BY ID
 * ============================================
 */
export const getTask = async (req: Request, res: Response) => {
  const taskId = parseInt(req.params.id);
  const userId = (req.user as any).id as number;

  const task = await TaskService.getTask(taskId, userId);

  res.status(200).json({
    success: true,
    message: 'Task retrieved successfully.',
    data: task,
  });
};

/**
 * ============================================
 * UPDATE TASK
 * ============================================
 */
export const updateTask = async (req: Request, res: Response) => {
  const taskId = parseInt(req.params.id);
  const userId = (req.user as any).id as number;
  const { title, description, status, priority, assignedTo, dueDate } =
    req.body;

  const updatedTask = await TaskService.updateTask(taskId, userId, {
    title,
    description,
    status,
    priority,
    assignedTo,
    dueDate,
  });

  res.status(200).json({
    success: true,
    message: 'Task updated successfully.',
    data: updatedTask,
  });
};

/**
 * ============================================
 * DELETE TASK
 * ============================================
 */
export const deleteTask = async (req: Request, res: Response) => {
  const taskId = parseInt(req.params.id);
  const userId = (req.user as any).id as number;

  const result = await TaskService.deleteTask(taskId, userId);

  res.status(200).json({
    success: true,
    message: result.message,
  });
};

/**
 * ============================================
 * GET MY TASKS
 * ============================================
 */
export const getMyTasks = async (req: Request, res: Response) => {
  const orgId = parseInt(req.params.orgId);
  const userId = (req.user as any).id as number;

  const tasks = await TaskService.getTasksByAssignee(userId, orgId);

  res.status(200).json({
    success: true,
    message: 'User tasks retrieved successfully.',
    data: tasks,
  });
};

/**
 * ============================================
 * GET TASKS BY SPECIFIC USER
 * ============================================
 */
export const getTasksByUser = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);
  const organizationId = parseInt(req.query.organizationId as string);
  const requestingUserId = (req.user as any).id as number;

  if (userId !== requestingUserId) {
    const requesterMembership = await TaskService.getMembership(
      requestingUserId,
      organizationId
    );

    if (
      !requesterMembership ||
      !['OWNER', 'ADMIN'].includes(requesterMembership.role)
    ) {
      throw new Error(
        "You do not have permission to view this user's tasks. Only admins can view team member tasks."
      );
    }
  }

  const tasks = await TaskService.getTasksByAssignee(userId, organizationId);

  res.status(200).json({
    success: true,
    message: 'User tasks retrieved successfully.',
    data: tasks,
  });
};

/**
 * ============================================
 * GET ALL TASKS IN ORGANIZATION
 * ============================================
 */
export const getAllTasksInOrganization = async (
  req: Request,
  res: Response
) => {
  const orgId = parseInt(req.params.orgId);
  const userId = (req.user as any).id as number;
  const { status, priority, assignedTo } = req.query;

  const tasks = await TaskService.getAllTasksInOrganization(orgId, userId, {
    status: status ? (status as string) : undefined,
    priority: priority ? (priority as string) : undefined,
    assignedTo: assignedTo ? parseInt(assignedTo as string) : undefined,
  });

  res.status(200).json({
    success: true,
    message: 'Organization tasks retrieved successfully.',
    data: tasks,
  });
};

/**
 * ============================================
 * GET PROJECT TASKS WITH DETAILS
 * ============================================
 */
export const getProjectTasksWithDetails = async (
  req: Request,
  res: Response
) => {
  const projectId = parseInt(req.params.projectId);
  const userId = (req.user as any).id as number;
  const { status, priority, assignedTo } = req.query;

  const tasks = await TaskService.getTasks(projectId, userId, {
    status: status ? (status as string) : undefined,
    priority: priority ? (priority as string) : undefined,
    assignedTo: assignedTo ? parseInt(assignedTo as string) : undefined,
  });

  res.status(200).json({
    success: true,
    message: 'Tasks retrieved successfully.',
    data: tasks,
    summary: {
      total: tasks.length,
      byStatus: tasks.reduce(
        (acc: Record<string, number>, task: any) => {
          acc[task.status] = (acc[task.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
      byPriority: tasks.reduce(
        (acc: Record<string, number>, task: any) => {
          acc[task.priority] = (acc[task.priority] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
    },
  });
};
