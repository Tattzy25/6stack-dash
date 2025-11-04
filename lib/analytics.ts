import { sql } from './database';

export type AnalyticsOverviewData = {
  totalKeyholders: number; // Updated from totalUsers
  activeSessions: number;
  ideasGenerated: number; // Updated from imagesGenerated
  contentItems: number; // New metric for content generation
  totalRequests: number; // New metric for total requests
  tokensUsed: number; // Updated from tokensLeft
  currency: string;
};

const defaultAnalytics: AnalyticsOverviewData = {
  totalKeyholders: 0,
  activeSessions: 0,
  ideasGenerated: 0,
  contentItems: 0,
  totalRequests: 0,
  tokensUsed: 0,
  currency: 'USD',
};

export async function getAnalyticsOverview(): Promise<AnalyticsOverviewData> {
  try {
    // Query comprehensive data from ask_tattty tables
    const [
      totalKeyholdersResult,
      ideasGeneratedResult,
      contentItemsResult,
      activeSessionsResult,
      totalRequestsResult,
      tokensUsedResult
    ] = await Promise.all([
      sql`SELECT COUNT(DISTINCT keyholder_id) as count FROM ask_tattty_requests WHERE keyholder_id IS NOT NULL`,
      sql`SELECT COUNT(*) as count FROM ask_tattty_requests WHERE action_type = 'ideas'`,
      sql`SELECT COUNT(*) as count FROM ask_tattty_content WHERE content_type IN ('idea', 'strategy', 'analysis')`,
      sql`SELECT COUNT(DISTINCT session_id) as count FROM keyholder_sessions WHERE status = 'active' AND last_activity_at >= NOW() - INTERVAL '30 MINUTES'`,
      sql`SELECT COUNT(*) as count FROM ask_tattty_requests`,
      sql`SELECT COALESCE(SUM(tokens_used), 0) as total FROM ask_tattty_requests`
    ]);

    const totalKeyholders = Number(totalKeyholdersResult[0]?.count || 0);
    const ideasGenerated = Number(ideasGeneratedResult[0]?.count || 0);
    const contentItems = Number(contentItemsResult[0]?.count || 0);
    const activeSessions = Number(activeSessionsResult[0]?.count || 0);
    const totalRequests = Number(totalRequestsResult[0]?.count || 0);
    const tokensUsed = Number(tokensUsedResult[0]?.total || 0);

    return {
      totalKeyholders,
      activeSessions,
      ideasGenerated,
      contentItems,
      totalRequests,
      tokensUsed,
      currency: 'USD',
    };
  } catch (error) {
    console.error('Failed to fetch analytics data:', error);
    // Return default data on error
    return defaultAnalytics;
  }
}

// New function to get session and activity logs
export async function getSessionActivityLogs(limit: number = 50): Promise<any[]> {
  try {
    const result = await sql`
      SELECT 
        s.session_id,
        s.keyholder_id,
        s.started_at,
        s.last_activity_at,
        s.status,
        s.total_requests,
        s.total_tokens_used,
        COUNT(r.id) as recent_requests
      FROM keyholder_sessions s
      LEFT JOIN ask_tattty_requests r ON s.session_id = r.session_id 
        AND r.created_at >= NOW() - INTERVAL '1 HOUR'
      GROUP BY s.session_id, s.keyholder_id, s.started_at, s.last_activity_at, s.status, s.total_requests, s.total_tokens_used
      ORDER BY s.last_activity_at DESC
      LIMIT ${limit}
    `;
    
    return result;
  } catch (error) {
    console.error('Failed to fetch session activity logs:', error);
    return [];
  }
}

// New function to get recent ask_tattty requests
export async function getRecentRequests(limit: number = 20): Promise<any[]> {
  try {
    const result = await sql`
      SELECT 
        r.id,
        r.session_id,
        r.keyholder_id,
        r.action_type,
        r.status,
        r.tokens_used,
        r.processing_time_ms,
        r.created_at,
        c.content_title,
        c.content_type
      FROM ask_tattty_requests r
      LEFT JOIN ask_tattty_content c ON r.id = c.id
      ORDER BY r.created_at DESC
      LIMIT ${limit}
    `;
    
    return result;
  } catch (error) {
    console.error('Failed to fetch recent requests:', error);
    return [];
  }
}
