import { NextResponse } from 'next/server';
import { getAnalyticsOverview } from '@/lib/analytics';

export async function GET() {
  try {
    const data = await getAnalyticsOverview();

    return NextResponse.json({
      data,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[analytics] Failed to load overview data:', error);

    return NextResponse.json(
      {
        error: 'Unable to load analytics overview',
      },
      { status: 500 },
    );
  }
}
