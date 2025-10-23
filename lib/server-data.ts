import { sql } from "@/lib/database"

// Server-side functions for fetching dashboard data
export async function getDashboardKPIs() {
  try {
    // Total users count - this should always work
    const [totalUsersResult] = await sql`SELECT COUNT(*) as count FROM users`

    // Total generations/images created - this should always work
    const [generationsResult] = await sql`SELECT COUNT(*) as count FROM generations`

    return {
      totalUsers: Number(totalUsersResult.count) || 0,
      imagesGenerated: Number(generationsResult.count) || 0,
      activeSessions: 0, // Placeholder - will be 0 until we know correct column names
      sales: 0, // Placeholder - will be 0 until we know correct column names
      tokensLeft: 10000, // Placeholder - will show 10k until we know correct schemas
      currency: "USD"
    }
  } catch (error) {
    console.error('Error fetching dashboard KPIs:', error)
    return {
      totalUsers: 0,
      imagesGenerated: 0,
      activeSessions: 0,
      sales: 0,
      tokensLeft: 0,
      currency: "USD"
    }
  }
}

export async function getActivityFeed(limit: number = 50) {
  try {
    // Get activity from generations table (simplified, no JOIN)
    const activities = await sql`
      SELECT
        to_char(created_at, 'YYYY-MM-DD HH24:MI:SS') as time,
        'System' as user,
        'generation' as action,
        'Tattoo generated' as target
      FROM generations
      ORDER BY created_at DESC
      LIMIT ${limit}
    `

    return activities.map((activity: any) => ({
      time: activity.time,
      user: activity.user,
      action: activity.action,
      target: activity.target
    }))
  } catch (error) {
    console.error('Error fetching activity feed:', error)
    return []
  }
}

export async function getAnalyticsData() {
  try {
    // Get generation analytics by date
    const eventData = await sql`
      SELECT
        'generation' as event_name,
        COUNT(*) as count,
        date(created_at) as date
      FROM generations
      GROUP BY date(created_at)
      ORDER BY date(created_at) DESC
      LIMIT 30
    `

    // Get usage statistics as KPIs
    const kpis = await sql`
      SELECT
        counter_name as metric_name,
        total_count as metric_value,
        'usage' as metric_type,
        now() as period_start,
        now() as period_end
      FROM usage_counters
      ORDER BY total_count DESC
      LIMIT 10
    `

    return {
      events: eventData.map((item: any) => ({
        eventName: item.event_name,
        count: Number(item.count),
        date: item.date
      })),
      kpis: kpis.map((item: any) => ({
        metricName: item.metric_name,
        metricValue: Number(item.metric_value),
        metricType: item.metric_type,
        periodStart: item.period_start,
        periodEnd: item.period_end
      }))
    }
  } catch (error) {
    console.error('Error fetching analytics data:', error)
    return {
      events: [],
      kpis: []
    }
  }
}

export async function getReportData() {
  try {
    // Get various report data (users, generations, sessions)
    const [totalUsers] = await sql`SELECT COUNT(*) as count FROM users`
    const [totalSessions] = await sql`SELECT COUNT(*) as count FROM user_activity_sessions`
    const [totalActivities] = await sql`SELECT COUNT(*) as count FROM generations`

    return {
      totalUsers: Number(totalUsers.count) || 0,
      totalSessions: Number(totalSessions.count) || 0,
      totalActivities: Number(totalActivities.count) || 0,
      dateRange: {
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        to: new Date()
      }
    }
  } catch (error) {
    console.error('Error fetching report data:', error)
    return {
      totalUsers: 0,
      totalSessions: 0,
      totalActivities: 0,
      dateRange: { from: new Date(), to: new Date() }
    }
  }
}
