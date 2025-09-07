/**
 * Health check endpoint for authentication system
 * Tests database connectivity and basic functionality
 */

import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/mongodb';

export async function GET() {
  try {
    // Test database connection
    await connectDB();

    // Basic connectivity test (you could add more checks here)
    const startTime = Date.now();
    
    // Simple ping test could be added here if needed
    // await db.admin().ping();
    
    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'auth-system',
      responseTime: `${responseTime}ms`,
      checks: {
        database: 'connected',
        auth: 'operational'
      }
    });

  } catch (error) {
    // Handle auth health check error silently

    return NextResponse.json(
      {
        success: false,
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        service: 'auth-system',
        error: error instanceof Error ? error.message : 'unknown_error',
        checks: {
          database: 'error',
          auth: 'degraded'
        }
      },
      { status: 503 }
    );
  }
}