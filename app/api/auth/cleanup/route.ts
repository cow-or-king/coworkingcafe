/**
 * Emergency session cleanup endpoint
 * Clears tokens and security data for troubleshooting
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRealIP, logSecurityEvent, cleanupOldSecurityEvents } from '@/lib/auth/security';

export async function POST(request: NextRequest) {
  const ip = getRealIP(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';

  try {
    // Log the cleanup request
    await logSecurityEvent({
      userId: undefined,
      action: 'SESSION_CLEANUP_REQUEST',
      resource: 'auth_cleanup',
      ip,
      userAgent,
      success: true,
      details: { reason: 'manual_cleanup' },
    });

    // Perform cleanup of old security events
    await cleanupOldSecurityEvents();

    const response = NextResponse.json({
      success: true,
      message: 'Session cleanup completed',
      timestamp: Date.now(),
    });

    // Set headers to prevent caching
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;

  } catch (error) {
    console.error('Session cleanup error:', error);

    await logSecurityEvent({
      userId: undefined,
      action: 'SESSION_CLEANUP_ERROR',
      resource: 'auth_cleanup',
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
        error: 'Session cleanup failed' 
      },
      { status: 500 }
    );
  }
}