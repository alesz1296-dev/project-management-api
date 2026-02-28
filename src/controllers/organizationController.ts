import { Request, Response } from 'express';
import { OrganizationService } from '../services/organizationService';

/**
 * ============================================
 * CREATE ORGANIZATION
 * ============================================
 */
export const createOrganization = async (req: Request, res: Response) => {
  const userId = (req.user as any).id;
  const { name, description, slug } = req.body;

  const organization = await OrganizationService.createOrganization(userId, {
    name,
    description,
    slug,
  });

  res.status(201).json({
    success: true,
    message: 'Organization created successfully.',
    data: organization,
  });
};

/**
 * ============================================
 * GET ORGANIZATIONS BY USER
 * ============================================
 */
export const getOrganizationsByUser = async (req: Request, res: Response) => {
  const userId = (req.user as any).id;

  const organizations =
    await OrganizationService.getOrganizationsByUser(userId);

  res.status(200).json({
    success: true,
    message: 'Organizations retrieved successfully.',
    data: organizations,
  });
};

/**
 * ============================================
 * GET ORGANIZATION BY ID
 * ============================================
 */
export const getOrganization = async (req: Request, res: Response) => {
  const orgId = parseInt(req.params.orgId);

  const organization = await OrganizationService.getOrganization(orgId);

  res.status(200).json({
    success: true,
    message: 'Organization retrieved successfully.',
    data: organization,
  });
};

/**
 * ============================================
 * UPDATE ORGANIZATION
 * ============================================
 */
export const updateOrganization = async (req: Request, res: Response) => {
  const orgId = parseInt(req.params.orgId);
  const userId = (req.user as any).id;
  const { name, description, slug } = req.body;

  const updatedOrganization = await OrganizationService.updateOrganization(
    orgId,
    userId,
    {
      name,
      description,
      slug,
    }
  );

  res.status(200).json({
    success: true,
    message: 'Organization updated successfully.',
    data: updatedOrganization,
  });
};

/**
 * ============================================
 * DELETE ORGANIZATION
 * ============================================
 */
export const deleteOrganization = async (req: Request, res: Response) => {
  const orgId = parseInt(req.params.orgId);
  const userId = (req.user as any).id;

  const result = await OrganizationService.deleteOrganization(orgId, userId);

  res.status(200).json({
    success: true,
    message: result.message,
  });
};
