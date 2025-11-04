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
  // Return mock data since database has been erased
  return {
    totalUsers: 0,
    activeSessions: 0,
    imagesGenerated: 0,
    sales: 0,
    tokensLeft: 0,
    currency: 'USD',
  };
}
