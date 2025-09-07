/**
 * Logout API route
 * Token invalidation following consigne.md
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // In a JWT-based system, logout is typically handled client-side
    // by removing the token from storage. Server-side logout would
    // require a token blacklist, which we can implement later if needed.
    
    // For now, we'll just return a success response
    // The client should remove the token from storage
    
    return NextResponse.json({
      success: true,
      message: 'Logout successful',
    });

  } catch (error) {
    // Handle logout error silently
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}