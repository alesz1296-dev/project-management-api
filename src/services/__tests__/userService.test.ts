import { UserService } from '../userService';
import { prisma } from '../../lib/prisma';
import * as bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../../middlewares/errorHandler';

// Mock Prisma
jest.mock('../../lib/prisma', () => ({
  prisma: {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// Mock bcryptjs
jest.mock('bcryptjs');

// Mock jsonwebtoken
jest.mock('jsonwebtoken');

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    test('should return all users without passwords', async () => {
      // Arrange
      const mockUsers = [
        {
          id: 1,
          email: 'user1@example.com',
          firstName: 'John',
          lastName: 'Doe',
          avatar: 'avatar1.jpg',
          createdAt: new Date('2026-01-01'),
        },
        {
          id: 2,
          email: 'user2@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
          avatar: 'avatar2.jpg',
          createdAt: new Date('2026-01-02'),
        },
      ];

      const mockFindMany = prisma.user.findMany as jest.Mock;
      mockFindMany.mockResolvedValueOnce(mockUsers);

      // Act
      const result = await UserService.getAllUsers();

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].email).toBe('user1@example.com');
      expect(result[1].email).toBe('user2@example.com');
      expect(result[0]).not.toHaveProperty('passwordHash');
      expect(mockFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          select: expect.objectContaining({
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
            createdAt: true,
          }),
        })
      );
    });

    test('should return empty array when no users exist', async () => {
      // Arrange
      const mockFindMany = prisma.user.findMany as jest.Mock;
      mockFindMany.mockResolvedValueOnce([]);

      // Act
      const result = await UserService.getAllUsers();

      // Assert
      expect(result).toHaveLength(0);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getUserById', () => {
    test('should return user by id', async () => {
      // Arrange
      const mockUser = {
        id: 1,
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        avatar: 'avatar.jpg',
        createdAt: new Date('2026-01-01'),
      };

      const mockFindUnique = prisma.user.findUnique as jest.Mock;
      mockFindUnique.mockResolvedValueOnce(mockUser);

      // Act
      const result = await UserService.getUserById(1);

      // Assert
      expect(result).toEqual(mockUser);
      expect(result.id).toBe(1);
      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: expect.objectContaining({
          id: true,
          email: true,
        }),
      });
    });

    test('should throw AppError 404 if user not found', async () => {
      // Arrange
      const mockFindUnique = prisma.user.findUnique as jest.Mock;
      mockFindUnique.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(UserService.getUserById(999)).rejects.toThrow(AppError);
      await expect(UserService.getUserById(999)).rejects.toThrow(
        'User not found'
      );
    });
  });

  describe('updateUserById', () => {
    test('should update user data', async () => {
      // Arrange
      const updateData = {
        firstName: 'Jane',
        lastName: 'Updated',
      };

      const mockUpdatedUser = {
        id: 1,
        email: 'user@example.com',
        firstName: 'Jane',
        lastName: 'Updated',
        avatar: 'avatar.jpg',
        createdAt: new Date('2026-01-01'),
      };

      const mockUpdate = prisma.user.update as jest.Mock;
      mockUpdate.mockResolvedValueOnce(mockUpdatedUser);

      // Act
      const result = await UserService.updateUserById(1, updateData);

      // Assert
      expect(result.firstName).toBe('Jane');
      expect(result.lastName).toBe('Updated');
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
        select: expect.objectContaining({
          id: true,
          email: true,
        }),
      });
    });

    test('should not expose passwordHash in updated user response', async () => {
      // Arrange
      const updateData = { avatar: 'new-avatar.jpg' };

      const mockUpdatedUser = {
        id: 1,
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        avatar: 'new-avatar.jpg',
        createdAt: new Date('2026-01-01'),
      };

      const mockUpdate = prisma.user.update as jest.Mock;
      mockUpdate.mockResolvedValueOnce(mockUpdatedUser);

      // Act
      const result = await UserService.updateUserById(1, updateData);

      // Assert
      expect(result).not.toHaveProperty('passwordHash');
    });
  });

  describe('deleteUserById', () => {
    test('should delete user by id', async () => {
      // Arrange
      const mockDeletedUser = {
        id: 1,
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        avatar: 'avatar.jpg',
        passwordHash: 'hashed_password',
        createdAt: new Date('2026-01-01'),
      };

      const mockDelete = prisma.user.delete as jest.Mock;
      mockDelete.mockResolvedValueOnce(mockDeletedUser);

      // Act
      const result = await UserService.deleteUserById(1);

      // Assert
      expect(result.id).toBe(1);
      expect(mockDelete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('registerUser', () => {
    test('should create a new user with hashed password', async () => {
      // Arrange
      const registerData = {
        email: 'newuser@example.com',
        password: 'SecurePassword123!',
        firstName: 'New',
        lastName: 'User',
      };

      const hashedPassword = 'hashed_password_abc123';
      const mockCreatedUser = {
        id: 3,
        email: 'newuser@example.com',
        firstName: 'New',
        lastName: 'User',
        avatar: null,
        createdAt: new Date('2026-02-28'),
      };

      const mockFindUnique = prisma.user.findUnique as jest.Mock;
      const mockCreate = prisma.user.create as jest.Mock;
      const mockBcryptHash = bcrypt.hash as jest.Mock;

      mockFindUnique.mockResolvedValueOnce(null); // User doesn't exist
      mockBcryptHash.mockResolvedValueOnce(hashedPassword);
      mockCreate.mockResolvedValueOnce(mockCreatedUser);

      // Act
      const result = await UserService.registerUser(registerData);

      // Assert
      expect(result.email).toBe('newuser@example.com');
      expect(result.firstName).toBe('New');
      expect(result).not.toHaveProperty('passwordHash');
      expect(mockBcryptHash).toHaveBeenCalledWith(registerData.password, 10);
      expect(mockCreate).toHaveBeenCalledWith({
        data: {
          email: registerData.email,
          passwordHash: hashedPassword,
          firstName: registerData.firstName,
          lastName: registerData.lastName,
        },
        select: expect.any(Object),
      });
    });

    test('should throw AppError 400 if email already exists', async () => {
      // Arrange
      const registerData = {
        email: 'existing@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      const mockFindUnique = prisma.user.findUnique as jest.Mock;
      // Setup mock to return existing user for ALL calls
      mockFindUnique.mockResolvedValue({
        id: 1,
        email: 'existing@example.com',
      });

      // Act & Assert - only call once since we're testing the error
      await expect(UserService.registerUser(registerData)).rejects.toThrow(
        'User with this email already exists'
      );
    });
  });

  describe('loginUser', () => {
    test('should login user successfully and return user + token', async () => {
      // Arrange
      const loginEmail = 'user@example.com';
      const loginPassword = 'SecurePassword123!';
      const hashedPassword = 'hashed_password_xyz789';
      const jwtToken = 'jwt_token_abc123';

      const mockUser = {
        id: 1,
        email: loginEmail,
        firstName: 'John',
        lastName: 'Doe',
        avatar: 'avatar.jpg',
        passwordHash: hashedPassword,
        createdAt: new Date('2026-01-01'),
      };

      const mockFindUnique = prisma.user.findUnique as jest.Mock;
      const mockBcryptCompare = bcrypt.compare as jest.Mock;
      const mockJwtSign = jwt.sign as jest.Mock;

      mockFindUnique.mockResolvedValueOnce(mockUser);
      mockBcryptCompare.mockResolvedValueOnce(true); // Password matches
      mockJwtSign.mockReturnValueOnce(jwtToken);

      // Act
      const result = await UserService.loginUser(loginEmail, loginPassword);

      // Assert
      expect(result.user.id).toBe(1);
      expect(result.user.email).toBe(loginEmail);
      expect(result.user).not.toHaveProperty('passwordHash');
      expect(result.token).toBe(jwtToken);
      expect(mockBcryptCompare).toHaveBeenCalledWith(
        loginPassword,
        hashedPassword
      );
      expect(mockJwtSign).toHaveBeenCalledWith(
        { id: 1, email: loginEmail },
        expect.any(String),
        { expiresIn: '24h' }
      );
    });

    test('should throw AppError 401 if user not found', async () => {
      // Arrange
      const mockFindUnique = prisma.user.findUnique as jest.Mock;
      mockFindUnique.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(
        UserService.loginUser('nonexistent@example.com', 'password')
      ).rejects.toThrow(AppError);
      await expect(
        UserService.loginUser('nonexistent@example.com', 'password')
      ).rejects.toThrow('Invalid email or password');
    });

    test('should throw AppError 401 if password is invalid', async () => {
      // Arrange
      const mockUser = {
        id: 1,
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        avatar: 'avatar.jpg',
        passwordHash: 'hashed_password_xyz789',
        createdAt: new Date('2026-01-01'),
      };

      const mockFindUnique = prisma.user.findUnique as jest.Mock;
      const mockBcryptCompare = bcrypt.compare as jest.Mock;

      mockFindUnique.mockResolvedValueOnce(mockUser);
      mockBcryptCompare.mockResolvedValueOnce(false); // Password doesn't match

      // Act & Assert
      await expect(
        UserService.loginUser('user@example.com', 'WrongPassword')
      ).rejects.toThrow(AppError);
      await expect(
        UserService.loginUser('user@example.com', 'WrongPassword')
      ).rejects.toThrow('Invalid email or password');
    });
  });
});
