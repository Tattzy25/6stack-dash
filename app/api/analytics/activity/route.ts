import { NextResponse } from 'next/server';
import { getSessionActivityLogs, getRecentRequests } from '@/lib/analytics';

export async function GET() {
  try {
    // Get real session activity logs from database
    const sessionActivity = await getSessionActivityLogs(50);
    
    // Get real recent requests from database
    const recentRequests = await getRecentRequests(20);
    
    // Transform data for the frontend
    const activityData = sessionActivity.map(session => ({
      id: session.session_id,
      type: 'session_activity',
      keyholder: session.keyholder_id || 'Anonymous',
      timestamp: session.last_activity_at || session.started_at,
      details: `Session ${session.status} with ${session.total_requests} requests`,
      metadata: {
        session_id: session.session_id,
        status: session.status,
        total_requests: session.total_requests,
        total_tokens_used: session.total_tokens_used,
        recent_requests: session.recent_requests
      }
    }));
    
    // Add recent requests as activity items
    const requestActivity = recentRequests.map(request => ({
      id: `request-${request.id}`,
      type: 'request_processed',
      keyholder: request.keyholder_id || 'System',
      timestamp: request.created_at,
      details: `${request.action_type} request ${request.status}`,
      metadata: {
        request_id: request.id,
        action_type: request.action_type,
        tokens_used: request.tokens_used,
        processing_time: request.processing_time_ms,
        content_title: request.content_title,
        content_type: request.content_type
      }
    }));
    
    // Combine and sort by timestamp
    const combinedActivity = [...activityData, ...requestActivity]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 30); // Limit to 30 most recent items

    return NextResponse.json({
      data: combinedActivity,
      fetchedAt: new Date().toISOString(),
      totalSessions: sessionActivity.length,
      totalRequests: recentRequests.length
    });
    
  } catch (error) {
    console.error('[analytics] Failed to load activity data:', error);

    return NextResponse.json(
      {
        error: 'Unable to load activity data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 },
    );
  }
}