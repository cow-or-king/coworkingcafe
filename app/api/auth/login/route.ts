/**
 * Login API route
 * Secure authentication following consigne.md
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { User } from '@/lib/models/user';
import { comparePassword } from '@/lib/auth/hash';
import { generateToken } from '@/lib/auth/jwt';
import { loginSchema } from '@/lib/auth/validation';
import { 
  logSecurityEvent, 
  getRealIP, 
  checkBruteForce, 
  recordFailedLogin, 
  resetLoginAttempts 
} from '@/lib/auth/security';
import type { AuthUser } from '@/lib/store/types';

export async function POST(request: NextRequest) {
  const ip = getRealIP(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';

  try {
    // Check brute force protection first
    const bruteForceCheck = await checkBruteForce(ip);
    if (bruteForceCheck.isBlocked) {
      await logSecurityEvent({
        userId: undefined,
        action: 'LOGIN_BLOCKED',
        resource: 'auth_login',
        ip,
        userAgent,
        success: false,
        details: {
          reason: 'brute_force_protection',
          remainingTime: bruteForceCheck.remainingTime,
          attempts: bruteForceCheck.attempts,
        },
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Too many login attempts. Please try again later.',
          remainingTime: bruteForceCheck.remainingTime,
        },
        { status: 429 }
      );
    }

    // Connect to database
    await connectDB();

    // Parse and validate request body
    const body = await request.json().catch(() => null);
    
    if (!body) {
      await logSecurityEvent({
        userId: undefined,
        action: 'LOGIN_INVALID_REQUEST',
        resource: 'auth_login',
        ip,
        userAgent,
        success: false,
        details: { reason: 'invalid_json' },
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request body',
        },
        { status: 400 }
      );
    }

    const validationResult = loginSchema.safeParse(body);
    
    if (!validationResult.success) {
      await logSecurityEvent({
        userId: undefined,
        action: 'LOGIN_VALIDATION_FAILED',
        resource: 'auth_login',
        ip,
        userAgent,
        success: false,
        details: { 
          reason: 'validation_error',
          errors: validationResult.error.issues,
        },
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input data',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      await recordFailedLogin(ip);
      await logSecurityEvent({
        userId: undefined,
        action: 'LOGIN_USER_NOT_FOUND',
        resource: 'auth_login',
        ip,
        userAgent,
        success: false,
        details: { email },
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email or password',
        },
        { status: 401 }
      );
    }

    // Check if account is active
    if (user.isAccountLocked()) {
      await logSecurityEvent({
        userId: user._id.toString(),
        action: 'LOGIN_ACCOUNT_LOCKED',
        resource: 'auth_login',
        ip,
        userAgent,
        success: false,
        details: {
          email,
          status: user.status,
          isActive: user.isActive,
        },
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Account is locked or inactive',
        },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      await recordFailedLogin(ip);
      await logSecurityEvent({
        userId: user._id.toString(),
        action: 'LOGIN_INVALID_PASSWORD',
        resource: 'auth_login',
        ip,
        userAgent,
        success: false,
        details: { email },
      });

      // Log failed login attempt to user record
      user.loginHistory = user.loginHistory || [];
      user.loginHistory.push({
        timestamp: new Date(),
        ip,
        userAgent,
        success: false,
      });
      await user.save();

      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email or password',
        },
        { status: 401 }
      );
    }

    // Reset brute force attempts on successful login
    await resetLoginAttempts(ip);

    // Update user login info
    user.lastLoginAt = new Date();
    user.loginHistory = user.loginHistory || [];
    user.loginHistory.push({
      timestamp: new Date(),
      ip,
      userAgent,
      success: true,
    });
    await user.save();

    // Create auth user object (without sensitive data)
    const authUser: AuthUser = {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
      isActive: user.isActive,
      permissions: user.permissions,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    // Generate JWT token
    const token = generateToken(authUser);

    // Log successful login
    await logSecurityEvent({
      userId: user._id.toString(),
      action: 'LOGIN_SUCCESS',
      resource: 'auth_login',
      ip,
      userAgent,
      success: true,
      details: {
        email,
        role: user.role,
      },
    });

    return NextResponse.json({
      success: true,
      user: authUser,
      token,
      message: 'Login successful',
    });

  } catch (error) {
    // Handle login error silently
    
    await logSecurityEvent({
      userId: undefined,
      action: 'LOGIN_ERROR',
      resource: 'auth_login',
      ip,
      userAgent,
      success: false,
      details: {
        error: error instanceof Error ? error.message : 'unknown_error',
      },
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}