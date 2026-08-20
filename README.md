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

- **Frontend:** http://localhost:5173
- **API:** http://localhost:3001

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Run API + frontend together |
| `npm run build` | Build frontend |
| `npm run start` | Production server (serves `dist/` + API) |
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
