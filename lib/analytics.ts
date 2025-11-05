import { sql } from './database';

export type AnalyticsOverviewData = {
  totalKeyholders: number; // Updated from totalUsers
  activeSessions: number;
  ideasGenerated: number; // Updated from imagesGenerated
  contentItems: number; // New metric for content generation
  totalRequests: number; // New metric for total requests
  tokensUsed: number; // Sum of total_tokens
  costUsd: number; // Sum of cost_usd
  currency: string;
};

const defaultAnalytics: AnalyticsOverviewData = {
  totalKeyholders: 0,
  activeSessions: 0,
  ideasGenerated: 0,
  contentItems: 0,
  totalRequests: 0,
  tokensUsed: 0,
  costUsd: 0,
  currency: 'USD',
};

export async function getAnalyticsOverview(): Promise<AnalyticsOverviewData> {
  try {
    // Align queries with Neon ops views and existing tables
    const [
      totalKeyholdersResult,
      ideasGeneratedResult,
      contentItemsResult,
      activeSessionsResult,
      totalRequestsResult,
      tokensUsedResult,
      costUsdResult
    ] = await Promise.all([
      sql`SELECT COUNT(*) AS count FROM keys`,
      sql`SELECT COUNT(*) AS count FROM ask_tattty_requests WHERE action_type = 'ideas' AND was_successful = TRUE`,
      sql`SELECT COUNT(*) AS count FROM ask_tattty_content`,
      sql`SELECT COUNT(DISTINCT session_id) AS count FROM ask_tattty_requests WHERE session_id IS NOT NULL AND created_at >= NOW() - INTERVAL '30 MINUTES'`,
      sql`SELECT COUNT(*) AS count FROM ask_tattty_requests`,
      sql`SELECT COALESCE(SUM(total_tokens), 0) AS total FROM ask_tattty_requests`,
      sql`SELECT COALESCE(SUM(cost_usd), 0) AS usd FROM ask_tattty_requests`
    ]);

    const totalKeyholders = Number(totalKeyholdersResult[0]?.count ?? 0);
    const ideasGenerated = Number(ideasGeneratedResult[0]?.count ?? 0);
    const contentItems = Number(contentItemsResult[0]?.count ?? 0);
    const activeSessions = Number(activeSessionsResult[0]?.count ?? 0);
    const totalRequests = Number(totalRequestsResult[0]?.count ?? 0);
    const tokensUsed = Number(tokensUsedResult[0]?.total ?? 0);
    const costUsd = Number(costUsdResult[0]?.usd ?? 0);

    return {
      totalKeyholders,
      activeSessions,
      ideasGenerated,
      contentItems,
      totalRequests,
      tokensUsed,
      costUsd,
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
        r.session_id,
        MIN(r.created_at) AS started_at,
        MAX(r.created_at) AS last_activity_at,
        CASE WHEN MAX(r.created_at) >= NOW() - INTERVAL '30 MINUTES' THEN 'active' ELSE 'inactive' END AS status,
        COUNT(*) AS total_requests,
        COALESCE(SUM(r.output_char_count), 0) AS total_output_chars,
        COALESCE(SUM(r.response_time_ms), 0) AS total_response_time_ms
      FROM ask_tattty_requests r
      WHERE r.session_id IS NOT NULL
      GROUP BY r.session_id
      ORDER BY last_activity_at DESC
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
        r.action_type,
        r.was_successful,
        r.response_time_ms,
        r.input_char_count,
        r.output_char_count,
        r.created_at
      FROM ask_tattty_requests r
      ORDER BY r.created_at DESC
      LIMIT ${limit}
    `;
    
    return result;
  } catch (error) {
    console.error('Failed to fetch recent requests:', error);
    return [];
  }
}
