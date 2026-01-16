import { NextResponse } from 'next/server';

export interface DashboardConfig {
  id: string;
  name: string;
  repos: string;
  filter: string;
}

export async function GET() {
  const dashboardsJson = process.env.GITHUB_DASHBOARDS || '[]';

  let dashboards: DashboardConfig[] = [];
  try {
    dashboards = JSON.parse(dashboardsJson);
  } catch (error) {
    console.error('Failed to parse GITHUB_DASHBOARDS:', error);
  }

  return NextResponse.json({
    dashboards,
  });
}
