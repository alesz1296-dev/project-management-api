// User model - represents a user in the database

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  bio?: string;
  avatarUrl?: string;
  isActive: boolean;
  emailVerified: boolean;
  emailVerifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  createdAt: Date;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
  createdAt: Date;
}
