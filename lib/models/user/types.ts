import type { Document } from "mongoose";
import type { ObjectId } from "mongodb";

export type UserRole = "admin" | "manager" | "staff" | "client";

export type UserStatus = "active" | "inactive" | "suspended" | "pending";

export interface LoginAttempt {
  timestamp: Date;
  ip: string;
  userAgent: string;
  success: boolean;
}

export interface UserPreferences {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  language: string;
  timezone: string;
}

export interface IUser extends Document {
  _id: ObjectId;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  bio?: string;
  role: UserRole;
  permissions: string[];
  isActive: boolean;
  status: UserStatus;
  emailVerified?: Date;
  image?: string;
  phone?: string;
  preferences?: UserPreferences;
  lastLoginAt?: Date;
  loginHistory?: LoginAttempt[];
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  twoFactorSecret?: string;
  twoFactorEnabled: boolean;
  isOnline: boolean;
  lastActive?: Date;
  createdAt: Date;
  updatedAt: Date;
  // Virtual properties
  fullName: string;
  displayName: string;
  isEmailVerified: boolean;
  daysSinceLastLogin: number | null;
}

// Query interfaces for type safety
export interface UserQuery {
  role?: UserRole;
  isActive?: boolean;
  status?: UserStatus;
  email?: string;
}

export interface ActiveUsersQuery {
  isActive: true;
  status: "active";
  role?: UserRole;
}

export interface SearchUsersQuery {
  $or: Array<{
    firstName?: { $regex: string; $options: string };
    lastName?: { $regex: string; $options: string };
    email?: { $regex: string; $options: string };
    name?: { $regex: string; $options: string };
  }>;
  role?: UserRole;
}

// Method interfaces
export interface UserMethods {
  hasPermission(permission: string): boolean;
  hasRole(roles: UserRole | UserRole[]): boolean;
  canManage(): boolean;
  isAccountLocked(): boolean;
  getRecentLoginAttempts(hours?: number): number;
}

export interface UserStatics {
  findByEmail(email: string): Promise<IUser | null>;
  findActiveUsers(role?: UserRole): Promise<IUser[]>;
  findByRole(role: UserRole): Promise<IUser[]>;
  searchUsers(searchTerm: string, role?: UserRole, limit?: number): Promise<IUser[]>;
}

export interface UserModel extends UserMethods, UserStatics {}