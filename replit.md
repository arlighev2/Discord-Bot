# Donut Stats

A stats dashboard and Discord bot for the DonutSMP Minecraft server. Players can search any username to view money, shards, playtime, kills, blocks, and more — all pulled from the official DonutSMP API.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000) + Discord bot
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required secrets: `DISCORD_BOT_TOKEN`, `DONUTSMP_API_TOKEN`, `DATABASE_URL`

## Stack

- pnpm workspaces, Node.js 20, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (bundled to `dist/index.mjs`)
- Discord bot: discord.js v14

## Where things live

- `artifacts/api-server/src/app.ts` — Express app + all SSR HTML pages (home, players, player profile)
- `artifacts/api-server/src/routes/donut.ts` — proxy routes to DonutSMP API
- `artifacts/api-server/src/bot/bot.ts` — Discord bot (tickets, giveaways, XP, moderation)
- `artifacts/api-server/src/index.ts` — server entry point (starts Express + bot)
- `lib/db/src/schema/` — Drizzle ORM schema
- `lib/api-spec/` — OpenAPI spec (source of truth for API contracts)

## Architecture decisions

- The web dashboard is server-side rendered (SSR) using plain HTML/CSS strings from Express — no React on the frontend.
- The Discord bot and web server run in the same process, started together in `index.ts`.
- The DonutSMP API key (`DONUTSMP_API_TOKEN`) is only used server-side — never exposed to the browser.
- Bot state (giveaways, tickets, etc.) is persisted via PostgreSQL through Drizzle ORM.

## Product

- **Home page** (`/`): Hero with live online player count from DonutSMP API.
- **Players page** (`/players`): Search bar + popular players grid.
- **Player profile** (`/player/:username`): Full stats card — money, shards, playtime, kills, deaths, K/D, mobs, blocks, shop earnings.
- **Discord bot**: Ticket system, giveaways, XP/leveling, moderation commands.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- `DONUTSMP_API_TOKEN` is the correct secret name (the code previously used `DONUTSMP_API_KEY` — this was fixed during migration).
- Always run `pnpm install` from the workspace root before running dev, not from individual package dirs.
- The `dev` script runs `build` then `start` — no hot reload; rebuild manually after code changes.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
