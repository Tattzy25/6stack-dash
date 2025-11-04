import { sql } from './database';

export type AnalyticsOverviewData = {
  totalUsers: number;
  activeSessions: number;
  imagesGenerated: number;
  sales: number;
  tokensLeft: number;
  currency: string;
};

const defaultAnalytics: AnalyticsOverviewData = {
  totalUsers: 0,
  activeSessions: 0,
  imagesGenerated: 0,
  sales: 0,
  tokensLeft: 0,
  currency: 'USD',
};

export async function getAnalyticsOverview(): Promise<AnalyticsOverviewData> {
  try {
    // Query real data from ask_tattty_requests table
    const [totalKeyholdersResult, ideasGeneratedResult, activeSessionsResult] = await Promise.all([
      sql`SELECT COUNT(DISTINCT session_id) as count FROM ask_tattty_requests`,
      sql`SELECT COUNT(*) as count FROM ask_tattty_requests WHERE action_type = 'ideas'`,
      sql`SELECT COUNT(DISTINCT session_id) as count FROM ask_tattty_requests WHERE created_at >= NOW() - INTERVAL '24 HOURS'`,
    ]);

    const totalKeyholders = Number(totalKeyholdersResult[0]?.count || 0);
    const ideasGenerated = Number(ideasGeneratedResult[0]?.count || 0);
    const activeSessions = Number(activeSessionsResult[0]?.count || 0);

    return {
      totalUsers: totalKeyholders, // Renamed to keyholders
      activeSessions,
      imagesGenerated: ideasGenerated, // Assuming 'ideas' action generates ideas/images
      sales: 0, // No sales data
      tokensLeft: 0, // No tokens data
      currency: 'USD',
    };
  } catch (error) {
    console.error('Failed to fetch analytics data:', error);
    // Return default data on error
    return defaultAnalytics;
  }
}
