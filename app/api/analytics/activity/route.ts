import { NextResponse } from 'next/server';
import { getSessionActivityLogs, getRecentRequests } from '@/lib/analytics';

export async function GET() {
  try {
    // Get real session activity logs from database
    const sessionActivity = await getSessionActivityLogs(50);
    
    // Get real recent requests from database
    const recentRequests = await getRecentRequests(20);
    
    // Transform data for the frontend
    const activityData = sessionActivity.map((session: any) => ({
      id: session.session_id,
      type: 'session_activity',
      keyholder: 'Anonymous',
      timestamp: session.last_activity_at || session.started_at,
      details: `Session ${session.status} with ${session.total_requests} requests`,
      metadata: {
        session_id: session.session_id,
        status: session.status,
        total_requests: session.total_requests,
        total_output_chars: session.total_output_chars,
        total_response_time_ms: session.total_response_time_ms,
      }
    }));
    
    // Add recent requests as activity items
    const requestActivity = recentRequests.map((request: any) => ({
      id: `request-${request.id}`,
      type: 'request_processed',
      keyholder: 'System',
      timestamp: request.created_at,
      details: `${request.action_type} request ${request.was_successful ? 'success' : 'failure'}`,
      metadata: {
        request_id: request.id,
        session_id: request.session_id,
        action_type: request.action_type,
        response_time_ms: request.response_time_ms,
        input_char_count: request.input_char_count,
        output_char_count: request.output_char_count,
        was_successful: request.was_successful,
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