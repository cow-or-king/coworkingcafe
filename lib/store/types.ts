/**
 * Redux store types
 * Centralized type definitions following consigne.md principles
 */

import type { UserRole, UserStatus } from '@/lib/models/user/types';

// Auth State
export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// User data for authentication
export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  status: UserStatus;
  isActive: boolean;
  permissions: string[];
  emailVerified?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// API Request/Response Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  success: boolean;
  user: AuthUser;
  token: string;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  code?: number;
}