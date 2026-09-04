# Lyfstyl — Food & Dance Social Platform

A full product experience for the Lyfstyl vision: structured food & dance communities, AI-style personalization, creation, gamification, and challenges.

## What's included

- **Auth** — Register, login, social sign-in modal (Google/Apple/Facebook demo flow)
- **Onboarding** — Age, country, language, interests, avatar picker
- **Discover** — Personalized feed, search with fuzziness, filters
- **Content** — Recipe & move detail pages with ingredients, steps, video, comments
- **Create** — Publish recipes and dance clips to communities
- **Communities** — Browse, join/leave, community detail pages with feeds
- **Creators** — Public creator profiles
- **Dashboard** — Points, badges, saved library, notifications, challenges
- **Gamification** — Stars, saves, points, badges (Bronze Chef → Legendary Creator)

## Run locally

```bash
npm install
npm run dev
```

- **Frontend (Next.js):** http://localhost:5173
- **API (Express):** http://localhost:3001

The Next.js dev server proxies `/api` and `/uploads` to the Express API.

### Frontend only

```bash
npm run dev:client
```

### API only

```bash
npm run dev:server
```

If port **5173** is already in use, stop the other process or run:

```bash
node ./node_modules/next/dist/bin/next dev --port 5174
```

> **Note:** On Windows you may see harmless `Watchpack Error` lines about `C:\` system files — the app still runs normally.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Run API + Next.js frontend together |
| `npm run build` | Build Next.js app |
| `npm run start` | Production: Next.js + API |
| `npm run seed` | Reset database |

## Routes

| Page | Path |
|------|------|
| Home | `/` |
| Discover | `/discover` |
| Recipes | `/recipes` · `/recipes/:id` |
| Moves | `/moves` · `/moves/:id` |
| Communities | `/community` · `/community/:slug` |
| Creator profile | `/creators/:id` |
| Challenges | `/challenges` |
| Dashboard | `/dashboard` (auth required) |
| Create | `/create` (auth required) |
| Join / Login | `/join` · `/login` |

Database: `server/data/lyfstyl.json`

## Environment

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | API base URL (default: `/api`) |
| `API_ORIGIN` | Express origin for Next.js rewrites (default: `http://localhost:3001`) |
| `PORT` | Express API port (default: `3001`) |
| `JWT_SECRET` | JWT signing secret |
