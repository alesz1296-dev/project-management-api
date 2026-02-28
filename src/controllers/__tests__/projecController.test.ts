import { Request, Response } from 'express';
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
} from '../projectController';
import { ProjectService } from '../../services/projectService';

jest.mock('../../services/projectService');

describe('ProjectController', () => {
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
   * createProject - Success
   * ============================================
   */
  test('createProject should create project successfully', async () => {
    const mockProject = {
      id: 1,
      name: 'Test Project',
      description: 'A test project',
      organizationId: 1,
      createdBy: 1,
      status: 'ACTIVE',
    };

    mockReq.params = { orgId: '1' };
    mockReq.body = { name: 'Test Project', description: 'A test project' };
    mockReq.user = { id: 1 };

    (ProjectService.createProject as jest.Mock).mockResolvedValueOnce(
      mockProject
    );

    await createProject(mockReq, mockRes);

    expect(ProjectService.createProject).toHaveBeenCalledWith(1, 1, {
      name: 'Test Project',
      description: 'A test project',
    });
    expect(mockStatus).toHaveBeenCalledWith(201);
    expect(mockJson).toHaveBeenCalledWith({
      success: true,
      message: 'Project created successfully.',
      data: mockProject,
    });
  });

  /**
   * ============================================
   * createProject - Unauthorized
   * ============================================
   */
  test('createProject should throw error if unauthorized', async () => {
    mockReq.params = { orgId: '1' };
    mockReq.body = { name: 'Test Project' };
    mockReq.user = { id: 1 };

    (ProjectService.createProject as jest.Mock).mockRejectedValueOnce(
      new Error('Unauthorized. Only organization members can create projects.')
    );

    await expect(createProject(mockReq, mockRes)).rejects.toThrow(
      'Unauthorized. Only organization members can create projects.'
    );
  });

  /**
   * ============================================
   * getProjectsByOrganization - Success
   * ============================================
   */
  test('getProjectsByOrganization should return all projects', async () => {
    const mockProjects = [
      { id: 1, name: 'Project 1', organizationId: 1, status: 'ACTIVE' },
      { id: 2, name: 'Project 2', organizationId: 1, status: 'ACTIVE' },
    ];

    mockReq.params = { orgId: '1' };

    (ProjectService.getProjects as jest.Mock).mockResolvedValueOnce(
      mockProjects
    );

    await getProjectsByOrganization(mockReq, mockRes);

    expect(ProjectService.getProjects).toHaveBeenCalledWith(1);
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({
      success: true,
      message: 'Projects retrieved successfully.',
      data: mockProjects,
    });
  });

  /**
   * ============================================
   * getProjectsByOrganization - Empty
   * ============================================
   */
  test('getProjectsByOrganization should return empty array', async () => {
    mockReq.params = { orgId: '1' };

    (ProjectService.getProjects as jest.Mock).mockResolvedValueOnce([]);

    await getProjectsByOrganization(mockReq, mockRes);

    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({
      success: true,
      message: 'Projects retrieved successfully.',
      data: [],
    });
  });

  /**
   * ============================================
   * getProject - Success
   * ============================================
   */
  test('getProject should return project by id', async () => {
    const mockProject = {
      id: 1,
      name: 'Test Project',
      description: 'A test project',
      organizationId: 1,
      status: 'ACTIVE',
    };

    mockReq.params = { id: '1' };

    (ProjectService.getProject as jest.Mock).mockResolvedValueOnce(mockProject);

    await getProject(mockReq, mockRes);

    expect(ProjectService.getProject).toHaveBeenCalledWith(1);
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({
      success: true,
      message: 'Project retrieved successfully.',
      data: mockProject,
    });
  });

  /**
   * ============================================
   * getProject - Not Found
   * ============================================
   */
  test('getProject should throw error if not found', async () => {
    mockReq.params = { id: '999' };

    (ProjectService.getProject as jest.Mock).mockRejectedValueOnce(
      new Error('Project not found.')
    );

    await expect(getProject(mockReq, mockRes)).rejects.toThrow(
      'Project not found.'
    );
  });

  /**
   * ============================================
   * updateProject - Success
   * ============================================
   */
  test('updateProject should update project successfully', async () => {
    const mockUpdatedProject = {
      id: 1,
      name: 'Updated Project',
      description: 'Updated description',
      status: 'ARCHIVED',
      organizationId: 1,
    };

    mockReq.params = { id: '1' };
    mockReq.body = {
      name: 'Updated Project',
      description: 'Updated description',
      status: 'ARCHIVED',
    };
    mockReq.user = { id: 1 };

    (ProjectService.updateProject as jest.Mock).mockResolvedValueOnce(
      mockUpdatedProject
    );

    await updateProject(mockReq, mockRes);

    expect(ProjectService.updateProject).toHaveBeenCalledWith(1, 1, {
      name: 'Updated Project',
      description: 'Updated description',
      status: 'ARCHIVED',
    });
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({
      success: true,
      message: 'Project updated successfully.',
      data: mockUpdatedProject,
    });
  });

  /**
   * ============================================
   * updateProject - Unauthorized
   * ============================================
   */
  test('updateProject should throw error if unauthorized', async () => {
    mockReq.params = { id: '1' };
    mockReq.body = { name: 'Updated' };
    mockReq.user = { id: 1 };

    (ProjectService.updateProject as jest.Mock).mockRejectedValueOnce(
      new Error('Unauthorized. Only project members can update.')
    );

    await expect(updateProject(mockReq, mockRes)).rejects.toThrow(
      'Unauthorized. Only project members can update.'
    );
  });

  /**
   * ============================================
   * deleteProject - Success
   * ============================================
   */
  test('deleteProject should delete project successfully', async () => {
    mockReq.params = { id: '1' };
    mockReq.user = { id: 1 };

    (ProjectService.deleteProject as jest.Mock).mockResolvedValueOnce({
      message: 'Project deleted successfully.',
    });

    await deleteProject(mockReq, mockRes);

    expect(ProjectService.deleteProject).toHaveBeenCalledWith(1, 1);
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({
      success: true,
      message: 'Project deleted successfully.',
    });
  });

  /**
   * ============================================
   * deleteProject - Unauthorized
   * ============================================
   */
  test('deleteProject should throw error if unauthorized', async () => {
    mockReq.params = { id: '1' };
    mockReq.user = { id: 1 };

    (ProjectService.deleteProject as jest.Mock).mockRejectedValueOnce(
      new Error('Unauthorized. Only organization members can delete.')
    );

    await expect(deleteProject(mockReq, mockRes)).rejects.toThrow(
      'Unauthorized. Only organization members can delete.'
    );
  });

  /**
   * ============================================
   * getProjectsByStatus - Success
   * ============================================
   */
  test('getProjectsByStatus should return projects by status', async () => {
    const mockProjects = [
      { id: 1, name: 'Project 1', status: 'ACTIVE' },
      { id: 2, name: 'Project 2', status: 'ACTIVE' },
    ];

    mockReq.params = { status: 'ACTIVE' };

    (ProjectService.getProjectsByStatus as jest.Mock).mockResolvedValueOnce(
      mockProjects
    );

    await getProjectsByStatus(mockReq, mockRes);

    expect(ProjectService.getProjectsByStatus).toHaveBeenCalledWith('ACTIVE');
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({
      success: true,
      message: 'Projects retrieved successfully.',
      data: mockProjects,
    });
  });

  /**
   * ============================================
   * getProjectsByStatus - Archived
   * ============================================
   */
  test('getProjectsByStatus should return archived projects', async () => {
    const mockProjects = [
      { id: 1, name: 'Archived Project', status: 'ARCHIVED' },
    ];

    mockReq.params = { status: 'ARCHIVED' };

    (ProjectService.getProjectsByStatus as jest.Mock).mockResolvedValueOnce(
      mockProjects
    );

    await getProjectsByStatus(mockReq, mockRes);

    expect(ProjectService.getProjectsByStatus).toHaveBeenCalledWith('ARCHIVED');
    expect(mockStatus).toHaveBeenCalledWith(200);
  });

  /**
   * ============================================
   * addProjectMember - Success
   * ============================================
   */
  test('addProjectMember should add member to project', async () => {
    const mockMember = {
      id: 1,
      userId: 2,
      projectId: 1,
      role: 'MEMBER',
      user: { id: 2, email: 'user@example.com' },
    };

    mockReq.params = { projectId: '1' };
    mockReq.body = { userId: 2, role: 'MEMBER' };
    mockReq.user = { id: 1 };

    (ProjectService.addProjectMember as jest.Mock).mockResolvedValueOnce(
      mockMember
    );

    await addProjectMember(mockReq, mockRes);

    expect(ProjectService.addProjectMember).toHaveBeenCalledWith(
      1,
      2,
      'MEMBER',
      1
    );
    expect(mockStatus).toHaveBeenCalledWith(201);
    expect(mockJson).toHaveBeenCalledWith({
      success: true,
      message: 'User added to project successfully.',
      data: mockMember,
    });
  });

  /**
   * ============================================
   * addProjectMember - Unauthorized
   * ============================================
   */
  test('addProjectMember should throw error if unauthorized', async () => {
    mockReq.params = { projectId: '1' };
    mockReq.body = { userId: 2, role: 'MEMBER' };
    mockReq.user = { id: 1 };

    (ProjectService.addProjectMember as jest.Mock).mockRejectedValueOnce(
      new Error('Unauthorized. Only admin can add members.')
    );

    await expect(addProjectMember(mockReq, mockRes)).rejects.toThrow(
      'Unauthorized. Only admin can add members.'
    );
  });

  /**
   * ============================================
   * getProjectMembers - Success
   * ============================================
   */
  test('getProjectMembers should return all project members', async () => {
    const mockMembers = [
      { id: 1, userId: 1, projectId: 1, role: 'ADMIN' },
      { id: 2, userId: 2, projectId: 1, role: 'MEMBER' },
    ];

    mockReq.params = { projectId: '1' };

    (ProjectService.getProjectMembers as jest.Mock).mockResolvedValueOnce(
      mockMembers
    );

    await getProjectMembers(mockReq, mockRes);

    expect(ProjectService.getProjectMembers).toHaveBeenCalledWith(1);
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({
      success: true,
      message: 'Project members retrieved successfully.',
      data: mockMembers,
    });
  });

  /**
   * ============================================
   * getProjectMembers - Empty
   * ============================================
   */
  test('getProjectMembers should return empty array', async () => {
    mockReq.params = { projectId: '1' };

    (ProjectService.getProjectMembers as jest.Mock).mockResolvedValueOnce([]);

    await getProjectMembers(mockReq, mockRes);

    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({
      success: true,
      message: 'Project members retrieved successfully.',
      data: [],
    });
  });

  /**
   * ============================================
   * updateProjectMemberRole - Success
   * ============================================
   */
  test('updateProjectMemberRole should update member role', async () => {
    const mockUpdatedMember = {
      id: 1,
      userId: 2,
      projectId: 1,
      role: 'ADMIN',
      user: { id: 2, email: 'user@example.com' },
    };

    mockReq.params = { projectId: '1', userId: '2' };
    mockReq.body = { role: 'ADMIN' };
    mockReq.user = { id: 1 };

    (ProjectService.updateProjectMemberRole as jest.Mock).mockResolvedValueOnce(
      mockUpdatedMember
    );

    await updateProjectMemberRole(mockReq, mockRes);

    expect(ProjectService.updateProjectMemberRole).toHaveBeenCalledWith(
      1,
      2,
      'ADMIN',
      1
    );
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({
      success: true,
      message: 'Project member role updated successfully.',
      data: mockUpdatedMember,
    });
  });

  /**
   * ============================================
   * updateProjectMemberRole - Unauthorized
   * ============================================
   */
  test('updateProjectMemberRole should throw error if unauthorized', async () => {
    mockReq.params = { projectId: '1', userId: '2' };
    mockReq.body = { role: 'ADMIN' };
    mockReq.user = { id: 1 };

    (ProjectService.updateProjectMemberRole as jest.Mock).mockRejectedValueOnce(
      new Error('Unauthorized. Only admin can update roles.')
    );

    await expect(updateProjectMemberRole(mockReq, mockRes)).rejects.toThrow(
      'Unauthorized. Only admin can update roles.'
    );
  });

  /**
   * ============================================
   * removeProjectMember - Success
   * ============================================
   */
  test('removeProjectMember should remove member from project', async () => {
    mockReq.params = { projectId: '1', userId: '2' };
    mockReq.user = { id: 1 };

    (ProjectService.removeProjectMember as jest.Mock).mockResolvedValueOnce({
      message: 'Member removed successfully.',
    });

    await removeProjectMember(mockReq, mockRes);

    expect(ProjectService.removeProjectMember).toHaveBeenCalledWith(1, 2, 1);
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({
      success: true,
      message: 'Member removed successfully.',
    });
  });

  /**
   * ============================================
   * removeProjectMember - Unauthorized
   * ============================================
   */
  test('removeProjectMember should throw error if unauthorized', async () => {
    mockReq.params = { projectId: '1', userId: '2' };
    mockReq.user = { id: 1 };

    (ProjectService.removeProjectMember as jest.Mock).mockRejectedValueOnce(
      new Error('Unauthorized. Only admin can remove members.')
    );

    await expect(removeProjectMember(mockReq, mockRes)).rejects.toThrow(
      'Unauthorized. Only admin can remove members.'
    );
  });
});
