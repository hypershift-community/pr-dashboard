# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
pnpm run dev          # Start dev server at http://localhost:3000

# Build
pnpm run build        # Production build
pnpm run start        # Run production build

# Linting & Formatting (uses Biome, not ESLint directly)
pnpm run lint         # Check linting
pnpm run lint:fix     # Fix linting issues
pnpm run format       # Check formatting
pnpm run format:fix   # Fix formatting
pnpm run check        # Run all checks
pnpm run check:fix    # Fix all issues
```

## Architecture

This is a Next.js 16 App Router application (React 19, TypeScript, Tailwind CSS 4) that displays GitHub pull requests across multiple repositories.

### Data Flow

1. **Authentication**: Token comes from either `GITHUB_TOKEN` env var (server-side) or browser localStorage (client-side)
2. **API Layer** (`app/api/github/`): Server-side routes proxy requests to GitHub REST API
   - `auth/` - Reports whether server has token configured
   - `defaults/` - Returns `GITHUB_DEFAULT_REPOS` env var
   - `repos/` - Lists user's repositories
   - `pulls/` - Fetches PRs for selected repos
   - `labels/` - Fetches labels for selected repos
3. **Client Hooks** (`app/hooks/`): React hooks manage data fetching and state
   - `useRepositories` - Fetches available repos
   - `usePullRequests` - Fetches and filters PRs
   - `useColumnConfig` - Manages visible columns (persisted to localStorage)
4. **UI Components** (`app/components/`): Stateless display components

### Key Types (`app/types/index.ts`)

- `FilterOptions` - Filter state (states, labels, authors, searchQuery, etc.)
- `PullRequest` - Normalized PR with computed state (open/closed/merged/draft)
- `ColumnConfig` - Column visibility and ordering

### GitHub Client (`app/lib/github.ts`)

`GitHubClient` class handles all GitHub API calls with proper pagination and transforms GitHub API responses to internal types.

## Environment Variables

```bash
GITHUB_TOKEN=ghp_xxx           # Server-side token (recommended)
GITHUB_DEFAULT_REPOS=org/repo1,org/repo2  # Pre-selected repos
```
