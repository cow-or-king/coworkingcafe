/**
 * Registration API route
 * Secure user creation following consigne.md
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';
import { User } from '@/lib/models/user';
import { hashPassword } from '@/lib/auth/hash';
import { generateToken } from '@/lib/auth/jwt';
import { registerSchema } from '@/lib/auth/validation';
import type { AuthUser } from '@/lib/store/types';

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    // Parse and validate request body
    const body = await request.json();
    const validationResult = registerSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input data',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { email, password, firstName, lastName } = validationResult.data;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'User with this email already exists',
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const user = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: 'client', // Default role
      status: 'active',
      isActive: true,
      permissions: [],
    });

    // Log registration
    user.loginHistory = [{
      timestamp: new Date(),
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      success: true,
    }];

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

    return NextResponse.json(
      {
        success: true,
        user: authUser,
        token,
        message: 'Registration successful',
      },
      { status: 201 }
    );

  } catch (error) {
    // Handle registration error silently
    
    // Handle duplicate key error
    if ((error as { code?: number }).code === 11000) {
      return NextResponse.json(
        {
          success: false,
          error: 'User with this email already exists',
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}