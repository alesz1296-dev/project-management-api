import {
  createOrganization,
  getOrganizationsByUser,
  getOrganization,
  updateOrganization,
  deleteOrganization,
} from '../organizationController';
import { OrganizationService } from '../../services/organizationService';

jest.mock('../../services/organizationService');

describe('OrganizationController', () => {
  let mockReq: any;
  let mockRes: any;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockJson = jest.fn().mockReturnThis();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockRes = { status: mockStatus, json: mockJson };
    mockReq = { body: {}, params: {}, user: { id: 1 } };
  });

  /**
   * ============================================
   * createOrganization - Success
   * ============================================
   */
  test('createOrganization should create organization successfully', async () => {
    const mockOrganization = {
      id: 1,
      name: 'Acme Corp',
      slug: 'acme-corp',
      description: 'A great company',
      ownerId: 1,
      createdAt: new Date(),
    };

    mockReq.body = {
      name: 'Acme Corp',
      slug: 'acme-corp',
      description: 'A great company',
    };
    mockReq.user = { id: 1 };

    (OrganizationService.createOrganization as jest.Mock).mockResolvedValueOnce(
      mockOrganization
    );

    await createOrganization(mockReq, mockRes);

    expect(OrganizationService.createOrganization).toHaveBeenCalledWith(1, {
      name: 'Acme Corp',
      slug: 'acme-corp',
      description: 'A great company',
    });
    expect(mockStatus).toHaveBeenCalledWith(201);
    expect(mockJson).toHaveBeenCalledWith({
      success: true,
      message: 'Organization created successfully.',
      data: mockOrganization,
    });
  });

  /**
   * ============================================
   * createOrganization - Slug Already Exists
   * ============================================
   */
  test('createOrganization should throw error if slug exists', async () => {
    mockReq.body = {
      name: 'Existing Org',
      slug: 'existing-org',
      description: 'Already exists',
    };
    mockReq.user = { id: 1 };

    (OrganizationService.createOrganization as jest.Mock).mockRejectedValueOnce(
      new Error('Organization slug already exists.')
    );

    await expect(createOrganization(mockReq, mockRes)).rejects.toThrow(
      'Organization slug already exists.'
    );
  });

  /**
   * ============================================
   * createOrganization - Missing Fields
   * ============================================
   */
  test('createOrganization should throw error if required fields missing', async () => {
    mockReq.body = { name: 'Org' };
    mockReq.user = { id: 1 };

    (OrganizationService.createOrganization as jest.Mock).mockRejectedValueOnce(
      new Error('Slug is required.')
    );

    await expect(createOrganization(mockReq, mockRes)).rejects.toThrow(
      'Slug is required.'
    );
  });

  /**
   * ============================================
   * getOrganizationsByUser - Success
   * ============================================
   */
  test('getOrganizationsByUser should return all user organizations', async () => {
    const mockOrganizations = [
      {
        id: 1,
        name: 'Company A',
        slug: 'company-a',
        description: 'First company',
        ownerId: 1,
      },
      {
        id: 2,
        name: 'Company B',
        slug: 'company-b',
        description: 'Second company',
        ownerId: 1,
      },
    ];

    mockReq.user = { id: 1 };

    (
      OrganizationService.getOrganizationsByUser as jest.Mock
    ).mockResolvedValueOnce(mockOrganizations);

    await getOrganizationsByUser(mockReq, mockRes);

    expect(OrganizationService.getOrganizationsByUser).toHaveBeenCalledWith(1);
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({
      success: true,
      message: 'Organizations retrieved successfully.',
      data: mockOrganizations,
    });
  });

  /**
   * ============================================
   * getOrganizationsByUser - Empty
   * ============================================
   */
  test('getOrganizationsByUser should return empty array if no orgs', async () => {
    mockReq.user = { id: 1 };

    (
      OrganizationService.getOrganizationsByUser as jest.Mock
    ).mockResolvedValueOnce([]);

    await getOrganizationsByUser(mockReq, mockRes);

    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({
      success: true,
      message: 'Organizations retrieved successfully.',
      data: [],
    });
  });

  /**
   * ============================================
   * getOrganization - Success
   * ============================================
   */
  test('getOrganization should return organization by id', async () => {
    const mockOrganizationData = {
      id: 1,
      name: 'Test Org',
      slug: 'test-org',
      description: 'Test description',
      ownerId: 1,
      owner: { id: 1, email: 'owner@example.com' },
    };

    mockReq.params = { orgId: '1' };

    (OrganizationService.getOrganization as jest.Mock).mockResolvedValueOnce(
      mockOrganizationData
    );

    await getOrganization(mockReq, mockRes);

    expect(OrganizationService.getOrganization).toHaveBeenCalledWith(1);
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({
      success: true,
      message: 'Organization retrieved successfully.',
      data: mockOrganizationData,
    });
  });

  /**
   * ============================================
   * getOrganization - Not Found
   * ============================================
   */
  test('getOrganization should throw error if not found', async () => {
    mockReq.params = { orgId: '999' };

    (OrganizationService.getOrganization as jest.Mock).mockRejectedValueOnce(
      new Error('Organization not found.')
    );

    await expect(getOrganization(mockReq, mockRes)).rejects.toThrow(
      'Organization not found.'
    );
  });

  /**
   * ============================================
   * updateOrganization - Success
   * ============================================
   */
  test('updateOrganization should update organization if owner', async () => {
    const mockUpdatedOrg = {
      id: 1,
      name: 'Updated Org',
      slug: 'updated-org',
      description: 'Updated description',
      ownerId: 1,
    };

    mockReq.params = { orgId: '1' };
    mockReq.body = {
      name: 'Updated Org',
      slug: 'updated-org',
      description: 'Updated description',
    };
    mockReq.user = { id: 1 };

    (OrganizationService.updateOrganization as jest.Mock).mockResolvedValueOnce(
      mockUpdatedOrg
    );

    await updateOrganization(mockReq, mockRes);

    expect(OrganizationService.updateOrganization).toHaveBeenCalledWith(1, 1, {
      name: 'Updated Org',
      slug: 'updated-org',
      description: 'Updated description',
    });
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({
      success: true,
      message: 'Organization updated successfully.',
      data: mockUpdatedOrg,
    });
  });

  /**
   * ============================================
   * updateOrganization - Unauthorized
   * ============================================
   */
  test('updateOrganization should throw error if not owner', async () => {
    mockReq.params = { orgId: '1' };
    mockReq.body = { name: 'Updated Org' };
    mockReq.user = { id: 1 };

    (OrganizationService.updateOrganization as jest.Mock).mockRejectedValueOnce(
      new Error('Unauthorized. Only OWNER can update organization.')
    );

    await expect(updateOrganization(mockReq, mockRes)).rejects.toThrow(
      'Unauthorized. Only OWNER can update organization.'
    );
  });

  /**
   * ============================================
   * updateOrganization - Slug Exists
   * ============================================
   */
  test('updateOrganization should throw error if slug exists', async () => {
    mockReq.params = { orgId: '1' };
    mockReq.body = { slug: 'taken-slug' };
    mockReq.user = { id: 1 };

    (OrganizationService.updateOrganization as jest.Mock).mockRejectedValueOnce(
      new Error('Slug already exists.')
    );

    await expect(updateOrganization(mockReq, mockRes)).rejects.toThrow(
      'Slug already exists.'
    );
  });

  /**
   * ============================================
   * deleteOrganization - Success
   * ============================================
   */
  test('deleteOrganization should delete organization if owner', async () => {
    mockReq.params = { orgId: '1' };
    mockReq.user = { id: 1 };

    (OrganizationService.deleteOrganization as jest.Mock).mockResolvedValueOnce(
      {
        message: 'Organization deleted successfully.',
      }
    );

    await deleteOrganization(mockReq, mockRes);

    expect(OrganizationService.deleteOrganization).toHaveBeenCalledWith(1, 1);
    expect(mockStatus).toHaveBeenCalledWith(200);
    expect(mockJson).toHaveBeenCalledWith({
      success: true,
      message: 'Organization deleted successfully.',
    });
  });

  /**
   * ============================================
   * deleteOrganization - Unauthorized
   * ============================================
   */
  test('deleteOrganization should throw error if not owner', async () => {
    mockReq.params = { orgId: '1' };
    mockReq.user = { id: 1 };

    (OrganizationService.deleteOrganization as jest.Mock).mockRejectedValueOnce(
      new Error('Unauthorized. Only OWNER can delete organization.')
    );

    await expect(deleteOrganization(mockReq, mockRes)).rejects.toThrow(
      'Unauthorized. Only OWNER can delete organization.'
    );
  });

  /**
   * ============================================
   * deleteOrganization - Not Found
   * ============================================
   */
  test('deleteOrganization should throw error if not found', async () => {
    mockReq.params = { orgId: '999' };
    mockReq.user = { id: 1 };

    (OrganizationService.deleteOrganization as jest.Mock).mockRejectedValueOnce(
      new Error('Organization not found.')
    );

    await expect(deleteOrganization(mockReq, mockRes)).rejects.toThrow(
      'Organization not found.'
    );
  });
});
