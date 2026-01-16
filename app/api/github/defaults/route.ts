import { NextResponse } from 'next/server';

export async function GET() {
  const defaultRepos = process.env.GITHUB_DEFAULT_REPOS || '';
  const repos = defaultRepos
    .split(',')
    .map((repo) => repo.trim())
    .filter((repo) => repo.length > 0);

  const defaultFilter = process.env.GITHUB_DEFAULT_FILTER || '';

  return NextResponse.json({
    repositories: repos,
    filters: defaultFilter,
  });
}
