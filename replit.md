# AniStream — Anime Release Tracker

## Overview

A responsive anime tracking website with a Netflix-inspired UI. Features real-time episode countdowns, streaming platform availability, AniList data, and browser notifications.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifacts/anime-tracker)
- **API framework**: Express 5 (artifacts/api-server)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Animations**: Framer Motion
- **Routing**: Wouter
- **Data fetching**: TanStack Query

## Architecture

### Frontend (artifacts/anime-tracker)
- Queries AniList GraphQL API directly from the browser (`https://graphql.anilist.co`)
- Uses TanStack Query for caching (5 min staleTime, 5 min refetchInterval)
- Routes: `/` Home, `/anime/:id` Detail, `/schedule` Weekly Schedule, `/following` My List

### Backend (artifacts/api-server)
- Stores user follows, schedule cache (for delay detection), notification preferences
- Routes: `/api/follows`, `/api/schedule/cache`, `/api/notification-prefs`

### Database Schema (lib/db/src/schema/)
- `followsTable` — user-followed anime
- `scheduleCacheTable` — cached airing timestamps for delay detection
- `notificationPrefsTable` — notification settings

## Key Features
- Live countdown timers (1s tick under 60min, 1min otherwise)
- "Airing Today" auto-refreshes every 60s
- Hero banner auto-rotates through top trending anime
- Platform badges (Crunchyroll, Netflix, Funimation, Prime Video, HIDIVE, Disney+, Hulu)
- JST toggle in navbar
- Browser Notification API integration
- Delay detection via schedule cache comparison
- Full dark theme, Netflix-style horizontal scrollable rows

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/anime-tracker run dev` — run frontend locally
