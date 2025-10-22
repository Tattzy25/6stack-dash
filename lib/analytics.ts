import { sql } from '@/lib/database';

export type AnalyticsOverviewData = {
  totalUsers: number;
  activeSessions: number;
  imagesGenerated: number;
  sales: number;
  tokensLeft: number;
  currency: string;
};

const toNumber = (value: unknown): number => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === 'string') {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : 0;
  }

  return 0;
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
  const metrics: AnalyticsOverviewData = { ...defaultAnalytics };

  const queries: Array<Promise<void>> = [
    (async () => {
      try {
        const rows = await sql`SELECT COUNT(*)::int AS value FROM users`;
        metrics.totalUsers = toNumber(rows[0]?.value);
      } catch (error) {
        console.warn('[analytics] Unable to read total users:', error);
      }
    })(),
    (async () => {
      try {
        const rows =
          await sql`SELECT COUNT(*)::int AS value FROM user_sessions WHERE status = 'active'`;
        metrics.activeSessions = toNumber(rows[0]?.value);
      } catch (error) {
        console.warn('[analytics] Unable to read active sessions:', error);
      }
    })(),
    (async () => {
      let aggregated = 0;

      try {
        const rows =
          await sql`SELECT COALESCE(SUM(metric_value), 0)::numeric AS total FROM kpi_metrics WHERE metric_name = 'images_generated'`;
        aggregated = toNumber(rows[0]?.total);
      } catch (error) {
        console.warn('[analytics] KPI metrics not available:', error);
      }

      if (aggregated > 0) {
        metrics.imagesGenerated = aggregated;
        return;
      }

      try {
        const fallback =
          await sql`SELECT COUNT(*)::int AS value FROM analytics_events WHERE event_name = 'image_generated'`;
        metrics.imagesGenerated = toNumber(fallback[0]?.value);
      } catch (error) {
        console.warn('[analytics] Unable to read generated images:', error);
      }
    })(),
    (async () => {
      try {
        const rows =
          await sql`SELECT COALESCE(SUM(amount), 0)::numeric AS total_sales, COALESCE(MAX(currency), 'USD') AS currency FROM transactions WHERE status = 'completed'`;
        metrics.sales = toNumber(rows[0]?.total_sales);
        metrics.currency = rows[0]?.currency ?? metrics.currency;
      } catch (error) {
        console.warn('[analytics] Unable to read sales totals:', error);
      }
    })(),
    (async () => {
      try {
        const rows =
          await sql`SELECT COALESCE(SUM(balance), 0)::int AS value FROM user_tokens`;
        metrics.tokensLeft = toNumber(rows[0]?.value);
      } catch (error) {
        console.warn('[analytics] Unable to read remaining tokens:', error);
      }
    })(),
  ];

  await Promise.all(queries);

  return metrics;
}
