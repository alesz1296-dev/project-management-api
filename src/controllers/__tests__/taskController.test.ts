import { Request, Response } from 'express';
import {
  createTask,
  getTasksByProject,
  getTask,
  updateTask,
  deleteTask,
  getMyTasks,
  getTasksByUser,
  getAllTasksInOrganization,
  getProjectTasksWithDetails,
} from '../taskController';
import { TaskService } from '../../services/taskService';

jest.mock('../../services/taskService');

describe('TaskController', () => {
  let mockReq: any;
  let mockRes: any;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockJson = jest.fn().mockReturnThis();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockRes = { status: mockStatus, json: mockJson };
    mockReq = { body: {}, params: {}, query: {}, user: { id: 1 } };
  });

  /**
   * ============================================
   * createTask - Success
   * ============================================
   */
  test('createTask should create task successfully', async () => {
    const mockTask = {
      id: 1,
      title: 'Test Task',
      description: 'A test task',
      projectId: 1,
      createdBy: 1,
      priority: 'HIGH',
      status: 'TODO',
    };

    mockReq.params = { projectId: '1' };
    mockReq.body = {
      title: 'Test Task',
      description: 'A test task',
      priority: 'HIGH',
      assignedTo: 2,
      dueDate: '2025-03-15',
    };
    mockReq.user = { id: 1 };

    (TaskService.createTask as jest.Mock).mockResolvedValueOnce(mockTask);

    await createTask(mockReq, mockRes);

    expect(TaskService.createTask).toHaveBeenCalledWith(1, 1, {
      title: 'Test Task',
      description: 'A test task',
      priority: 'HIGH',
      assignedTo: 2,
      dueDate: '2025-03-15',
    });
    expect(mockStatus).toHaveBeenCalledWith(201);
    expect(mockJson).toHaveBeenCalledWith({
      success: true,
      message: 'Task created successfully.',
      data: mockTask,
    });
  });

  /**
   * ============================================
   * createTask - Unauthorized
   * ============================================
   */
  test('createTask should throw error if unauthorized', async () => {
    mockReq.params = { projectId: '1' };
    mockReq.body = { title: 'Test Task' };
    mockReq.user = { id: 1 };

    (TaskService.createTask as jest.Mock).mockRejectedValueOnce(
      new Error('Unauthorized. Only project members can create tasks.')
    );

    await expect(createTask(mockReq, mockRes)).rejects.toThrow(
      'Unauthorized. Only project members can create tasks.'
    );
  });

  /**
   * ============================================
   * getTasksByProject - Success
   * ============================================
   */
  test('getTasksByProject should return all project tasks', async () => {
    const mockTasks = [
      {
        id: 1,
        title: 'Task 1',
        status: 'TODO',
        priority: 'HIGH',
        projectId: 1,
      },
      {
        id: 2,
        title: 'Task 2',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        projectId: 1,
      },
    ];

    mockReq.params = { projectId: '1' };
    mockReq.query = {};
    mockReq.user = { id: 1 };

    (TaskService.getTasks as jest.Mock).mockResolvedValueOnce(mockTasks);

    await getTasksByProject(mockReq, mockRes);

    expect(TaskService.getTasks).toHaveBeenCalledWith(1, 1, {
      status: undefined,
      priority: undefined,
      assignedTo: undefined,
    });
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({
      success: true,
      message: 'Tasks retrieved successfully.',
      data: mockTasks,
    });
  });

  /**
   * ============================================
   * getTasksByProject - With Filters
   * ============================================
   */
  test('getTasksByProject should filter tasks by status', async () => {
    const mockTasks = [
      { id: 1, title: 'Task 1', status: 'TODO', priority: 'HIGH' },
    ];

    mockReq.params = { projectId: '1' };
    mockReq.query = { status: 'TODO', priority: 'HIGH' };
    mockReq.user = { id: 1 };

    (TaskService.getTasks as jest.Mock).mockResolvedValueOnce(mockTasks);

    await getTasksByProject(mockReq, mockRes);

    expect(TaskService.getTasks).toHaveBeenCalledWith(1, 1, {
      status: 'TODO',
      priority: 'HIGH',
      assignedTo: undefined,
    });
    expect(mockStatus).toHaveBeenCalledWith(200);
  });

  /**
   * ============================================
   * getTasksByProject - Empty
   * ============================================
   */
  test('getTasksByProject should return empty array', async () => {
    mockReq.params = { projectId: '1' };
    mockReq.query = {};
    mockReq.user = { id: 1 };

    (TaskService.getTasks as jest.Mock).mockResolvedValueOnce([]);

    await getTasksByProject(mockReq, mockRes);

    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({
      success: true,
      message: 'Tasks retrieved successfully.',
      data: [],
    });
  });

  /**
   * ============================================
   * getTask - Success
   * ============================================
   */
  test('getTask should return task by id', async () => {
    const mockTask = {
      id: 1,
      title: 'Test Task',
      description: 'A test task',
      status: 'TODO',
      priority: 'HIGH',
    };

    mockReq.params = { id: '1' };
    mockReq.user = { id: 1 };

    (TaskService.getTask as jest.Mock).mockResolvedValueOnce(mockTask);

    await getTask(mockReq, mockRes);

    expect(TaskService.getTask).toHaveBeenCalledWith(1, 1);
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({
      success: true,
      message: 'Task retrieved successfully.',
      data: mockTask,
    });
  });

  /**
   * ============================================
   * getTask - Not Found
   * ============================================
   */
  test('getTask should throw error if not found', async () => {
    mockReq.params = { id: '999' };
    mockReq.user = { id: 1 };

    (TaskService.getTask as jest.Mock).mockRejectedValueOnce(
      new Error('Task not found.')
    );

    await expect(getTask(mockReq, mockRes)).rejects.toThrow('Task not found.');
  });

  /**
   * ============================================
   * updateTask - Success
   * ============================================
   */
  test('updateTask should update task successfully', async () => {
    const mockUpdatedTask = {
      id: 1,
      title: 'Updated Task',
      description: 'Updated description',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
    };

    mockReq.params = { id: '1' };
    mockReq.body = {
      title: 'Updated Task',
      description: 'Updated description',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
    };
    mockReq.user = { id: 1 };

    (TaskService.updateTask as jest.Mock).mockResolvedValueOnce(
      mockUpdatedTask
    );

    await updateTask(mockReq, mockRes);

    expect(TaskService.updateTask).toHaveBeenCalledWith(1, 1, {
      title: 'Updated Task',
      description: 'Updated description',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      assignedTo: undefined,
      dueDate: undefined,
    });
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({
      success: true,
      message: 'Task updated successfully.',
      data: mockUpdatedTask,
    });
  });

  /**
   * ============================================
   * updateTask - Unauthorized
   * ============================================
   */
  test('updateTask should throw error if unauthorized', async () => {
    mockReq.params = { id: '1' };
    mockReq.body = { title: 'Updated' };
    mockReq.user = { id: 1 };

    (TaskService.updateTask as jest.Mock).mockRejectedValueOnce(
      new Error('Unauthorized. Only project members can update tasks.')
    );

    await expect(updateTask(mockReq, mockRes)).rejects.toThrow(
      'Unauthorized. Only project members can update tasks.'
    );
  });

  /**
   * ============================================
   * deleteTask - Success
   * ============================================
   */
  test('deleteTask should delete task successfully', async () => {
    mockReq.params = { id: '1' };
    mockReq.user = { id: 1 };

    (TaskService.deleteTask as jest.Mock).mockResolvedValueOnce({
      message: 'Task deleted successfully.',
    });

    await deleteTask(mockReq, mockRes);

    expect(TaskService.deleteTask).toHaveBeenCalledWith(1, 1);
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({
      success: true,
      message: 'Task deleted successfully.',
    });
  });

  /**
   * ============================================
   * deleteTask - Unauthorized
   * ============================================
   */
  test('deleteTask should throw error if unauthorized', async () => {
    mockReq.params = { id: '1' };
    mockReq.user = { id: 1 };

    (TaskService.deleteTask as jest.Mock).mockRejectedValueOnce(
      new Error('Unauthorized. Only project members can delete tasks.')
    );

    await expect(deleteTask(mockReq, mockRes)).rejects.toThrow(
      'Unauthorized. Only project members can delete tasks.'
    );
  });

  /**
   * ============================================
   * getMyTasks - Success
   * ============================================
   */
  test('getMyTasks should return user assigned tasks', async () => {
    const mockTasks = [
      { id: 1, title: 'My Task 1', assignedTo: 1 },
      { id: 2, title: 'My Task 2', assignedTo: 1 },
    ];

    mockReq.params = { orgId: '1' };
    mockReq.user = { id: 1 };

    (TaskService.getTasksByAssignee as jest.Mock).mockResolvedValueOnce(
      mockTasks
    );

    await getMyTasks(mockReq, mockRes);

    expect(TaskService.getTasksByAssignee).toHaveBeenCalledWith(1, 1);
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({
      success: true,
      message: 'User tasks retrieved successfully.',
      data: mockTasks,
    });
  });

  /**
   * ============================================
   * getMyTasks - Empty
   * ============================================
   */
  test('getMyTasks should return empty array if no tasks', async () => {
    mockReq.params = { orgId: '1' };
    mockReq.user = { id: 1 };

    (TaskService.getTasksByAssignee as jest.Mock).mockResolvedValueOnce([]);

    await getMyTasks(mockReq, mockRes);

    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({
      success: true,
      message: 'User tasks retrieved successfully.',
      data: [],
    });
  });

  /**
   * ============================================
   * getTasksByUser - Same User
   * ============================================
   */
  test('getTasksByUser should return tasks for same user', async () => {
    const mockTasks = [{ id: 1, title: 'Task 1', assignedTo: 1 }];

    mockReq.params = { userId: '1' };
    mockReq.query = { organizationId: '1' };
    mockReq.user = { id: 1 };

    (TaskService.getTasksByAssignee as jest.Mock).mockResolvedValueOnce(
      mockTasks
    );

    await getTasksByUser(mockReq, mockRes);

    expect(TaskService.getTasksByAssignee).toHaveBeenCalledWith(1, 1);
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({
      success: true,
      message: 'User tasks retrieved successfully.',
      data: mockTasks,
    });
  });

  /**
   * ============================================
   * getTasksByUser - Different User (Admin)
   * ============================================
   */
  test('getTasksByUser should allow admin to view other user tasks', async () => {
    const mockTasks = [{ id: 1, title: 'Task 1', assignedTo: 2 }];

    mockReq.params = { userId: '2' };
    mockReq.query = { organizationId: '1' };
    mockReq.user = { id: 1 };

    (TaskService.getMembership as jest.Mock).mockResolvedValueOnce({
      role: 'ADMIN',
    });
    (TaskService.getTasksByAssignee as jest.Mock).mockResolvedValueOnce(
      mockTasks
    );

    await getTasksByUser(mockReq, mockRes);

    expect(TaskService.getMembership).toHaveBeenCalledWith(1, 1);
    expect(TaskService.getTasksByAssignee).toHaveBeenCalledWith(2, 1);
    expect(mockStatus).toHaveBeenCalledWith(200);
  });

  /**
   * ============================================
   * getTasksByUser - Different User (Not Admin)
   * ============================================
   */
  test('getTasksByUser should throw error if not admin viewing other user', async () => {
    mockReq.params = { userId: '2' };
    mockReq.query = { organizationId: '1' };
    mockReq.user = { id: 1 };

    (TaskService.getMembership as jest.Mock).mockResolvedValueOnce({
      role: 'MEMBER',
    });

    await expect(getTasksByUser(mockReq, mockRes)).rejects.toThrow(
      "You do not have permission to view this user's tasks. Only admins can view team member tasks."
    );
  });

  /**
   * ============================================
   * getAllTasksInOrganization - Success
   * ============================================
   */
  test('getAllTasksInOrganization should return all org tasks', async () => {
    const mockTasks = [
      { id: 1, title: 'Task 1', status: 'TODO' },
      { id: 2, title: 'Task 2', status: 'IN_PROGRESS' },
    ];

    mockReq.params = { orgId: '1' };
    mockReq.query = {};
    mockReq.user = { id: 1 };

    (TaskService.getAllTasksInOrganization as jest.Mock).mockResolvedValueOnce(
      mockTasks
    );

    await getAllTasksInOrganization(mockReq, mockRes);

    expect(TaskService.getAllTasksInOrganization).toHaveBeenCalledWith(1, 1, {
      status: undefined,
      priority: undefined,
      assignedTo: undefined,
    });
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({
      success: true,
      message: 'Organization tasks retrieved successfully.',
      data: mockTasks,
    });
  });

  /**
   * ============================================
   * getAllTasksInOrganization - With Filters
   * ============================================
   */
  test('getAllTasksInOrganization should filter tasks', async () => {
    const mockTasks = [
      { id: 1, title: 'Task 1', status: 'TODO', priority: 'HIGH' },
    ];

    mockReq.params = { orgId: '1' };
    mockReq.query = { status: 'TODO', priority: 'HIGH', assignedTo: '2' };
    mockReq.user = { id: 1 };

    (TaskService.getAllTasksInOrganization as jest.Mock).mockResolvedValueOnce(
      mockTasks
    );

    await getAllTasksInOrganization(mockReq, mockRes);

    expect(TaskService.getAllTasksInOrganization).toHaveBeenCalledWith(1, 1, {
      status: 'TODO',
      priority: 'HIGH',
      assignedTo: 2,
    });
    expect(mockStatus).toHaveBeenCalledWith(200);
  });

  /**
   * ============================================
   * getProjectTasksWithDetails - Success
   * ============================================
   */
  test('getProjectTasksWithDetails should return tasks with summary', async () => {
    const mockTasks = [
      { id: 1, title: 'Task 1', status: 'TODO', priority: 'HIGH' },
      { id: 2, title: 'Task 2', status: 'IN_PROGRESS', priority: 'MEDIUM' },
    ];

    mockReq.params = { projectId: '1' };
    mockReq.query = {};
    mockReq.user = { id: 1 };

    (TaskService.getTasks as jest.Mock).mockResolvedValueOnce(mockTasks);

    await getProjectTasksWithDetails(mockReq, mockRes);

    expect(TaskService.getTasks).toHaveBeenCalledWith(1, 1, {
      status: undefined,
      priority: undefined,
      assignedTo: undefined,
    });
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({
      success: true,
      message: 'Tasks retrieved successfully.',
      data: mockTasks,
      summary: {
        total: 2,
        byStatus: { TODO: 1, IN_PROGRESS: 1 },
        byPriority: { HIGH: 1, MEDIUM: 1 },
      },
    });
  });

  /**
   * ============================================
   * getProjectTasksWithDetails - With Summary
   * ============================================
   */
  test('getProjectTasksWithDetails should calculate correct summary', async () => {
    const mockTasks = [
      { id: 1, status: 'TODO', priority: 'HIGH' },
      { id: 2, status: 'TODO', priority: 'HIGH' },
      { id: 3, status: 'IN_PROGRESS', priority: 'MEDIUM' },
    ];

    mockReq.params = { projectId: '1' };
    mockReq.query = {};
    mockReq.user = { id: 1 };

    (TaskService.getTasks as jest.Mock).mockResolvedValueOnce(mockTasks);

    await getProjectTasksWithDetails(mockReq, mockRes);

    const callArgs = mockJson.mock.calls[0][0];
    expect(callArgs.summary.total).toBe(3);
    expect(callArgs.summary.byStatus.TODO).toBe(2);
    expect(callArgs.summary.byPriority.HIGH).toBe(2);
  });
});
