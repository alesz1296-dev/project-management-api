import { Request, Response } from 'express';
import { OrganizationService } from '../services/organizationService';

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

const validateUserId = (userId: number, res: Response): boolean => {
  if (!userId) {
    res.status(401).json({
      success: false,
      message: 'Unauthorized. User not authenticated.',
    });
    return false;
  }
  return true;
};

const validateUpdateFields = (
  name: string,
  description: string,
  slug: string,
  res: Response
): boolean => {
  if (!name && !description && !slug) {
    res.status(400).json({
      success: false,
      message: 'At least one field is required to update an organization.',
    });
    return false;
  }
  return true;
};

/**
 * ============================================
 * CREATE ORGANIZATION
 * ============================================
 */
export const createOrganization = async (req: Request, res: Response) => {
  try {
    // Get userId from authenticated user
    const userId = (req.user as any).id;
    const { name, description, slug } = req.body;

    // Call service to create organization
    const organization = await OrganizationService.createOrganization(userId, {
      name,
      description,
      slug,
    });

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Organization created successfully.',
      data: organization,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create organization.',
    });
  }
};

/**
 * ============================================
 * GET ORGANIZATIONS BY USER
 * ============================================
 */
export const getOrganizationsByUser = async (req: Request, res: Response) => {
  try {
    // Get userId from authenticated user
    const userId = (req.user as any).id;

    // Validate user is authenticated
    if (!validateUserId(userId, res)) return;

    // Call service to get all user's organizations
    const organizations =
      await OrganizationService.getOrganizationsByUser(userId);

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Organizations retrieved successfully.',
      data: organizations,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve organizations.',
    });
  }
};

/**
 * ============================================
 * GET ORGANIZATION BY ID
 * ============================================
 */
export const getOrganization = async (req: Request, res: Response) => {
  try {
    // Validate organization ID
    const orgId = validateOrgId(req.params.id, res);
    if (orgId === null) return;

    // Call service to get organization
    const organization = await OrganizationService.getOrganization(orgId);

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Organization retrieved successfully.',
      data: organization,
    });
  } catch (error: any) {
    // Return 404 if not found, otherwise 400
    const statusCode = error.message.includes('not found') ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Organization not found.',
    });
  }
};

/**
 * ============================================
 * UPDATE ORGANIZATION
 * ============================================
 */
export const updateOrganization = async (req: Request, res: Response) => {
  try {
    // Validate organization ID
    const orgId = validateOrgId(req.params.id, res);
    if (orgId === null) return;

    // Get userId from authenticated user
    const userId = (req.user as any).id;

    // Validate user is authenticated
    if (!validateUserId(userId, res)) return;

    // Get update data from request body
    const { name, description, slug } = req.body;

    // Validate at least one field is provided
    if (!validateUpdateFields(name, description, slug, res)) return;

    // Call service to update organization
    const updatedOrganization = await OrganizationService.updateOrganization(
      orgId,
      userId,
      {
        name,
        description,
        slug,
      }
    );

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Organization updated successfully.',
      data: updatedOrganization,
    });
  } catch (error: any) {
    // Return 404 if not found, otherwise 400
    const statusCode = error.message.includes('not found') ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to update organization.',
    });
  }
};

/**
 * ============================================
 * DELETE ORGANIZATION
 * ============================================
 */
export const deleteOrganization = async (req: Request, res: Response) => {
  try {
    // Validate organization ID
    const orgId = validateOrgId(req.params.id, res);
    if (orgId === null) return;

    // Get userId from authenticated user
    const userId = (req.user as any).id;

    // Validate user is authenticated
    if (!validateUserId(userId, res)) return;

    // Call service to delete organization
    const result = await OrganizationService.deleteOrganization(orgId, userId);

    // Return success response
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    // Return 404 if not found, otherwise 400
    const statusCode = error.message.includes('not found') ? 404 : 400;

    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to delete organization.',
    });
  }
};
