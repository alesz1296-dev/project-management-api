import { prisma } from '../lib/prisma';
import * as bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../middlewares/errorHandler'; //  Import AppError

export class UserService {
  static async getAllUsers() {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        createdAt: true,
      },
    });
    return users;
  }

  static async getUserById(id: number) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found.');
    }

    return user;
  }

  static async updateUserById(id: number, data: any) {
    const updatedUser = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        createdAt: true,
      },
    });
    return updatedUser;
  }

  static async deleteUserById(id: number) {
    const deletedUser = await prisma.user.delete({
      where: { id },
    });

    return deletedUser;
  }

  /**
   * Register a new user with hashed password
   */
  static async registerUser(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError(400, 'User with this email already exists.');
    }

    // Hash password with bcrypt
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(data.password, saltRounds);

    // Create new user with hashed password
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash: passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        createdAt: true,
      },
    });

    return user;
  }

  /**
   * Login user and return user data + JWT token
   */
  static async loginUser(email: string, password: string) {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        passwordHash: true,
        createdAt: true,
      },
    });

    if (!user) {
      // Use AppError with 401 status
      throw new AppError(401, 'Invalid email or password.');
    }

    // Compare password with hashed password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      // Use AppError with 401 status
      throw new AppError(401, 'Invalid email or password.');
    }

    // Remove passwordHash from response
    const { passwordHash: _, ...userWithoutPassword } = user;

    // Generate JWT token
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign({ id: user.id, email: user.email }, secret, {
      expiresIn: '24h',
    });

    return {
      user: userWithoutPassword,
      token,
    };
  }
}
