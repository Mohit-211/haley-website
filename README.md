# Haley Bettle — real estate site

Next.js 16 (App Router, Cache Components) + MySQL via Drizzle ORM.

## Setup

1. Install dependencies: `npm install`
2. Create a MySQL 8 database and user, then copy `.env.example` to `.env.local` and fill it in.
3. Create the tables: `npm run db:migrate`
4. Add New Brunswick and the first super admin (from `SEED_ADMIN_*`): `npm run db:seed`
5. Start the app: `npm run dev`, then sign in at `/admin/login`.

`DATABASE_URL` must also be available during `npm run build`: the home and listings pages are
prerendered from the database and refreshed whenever an admin saves a change.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run db:generate` | Create a new SQL migration in `drizzle/` after editing `src/db/schema.ts` |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:seed` | Add the starting province and super admin (safe to re-run) |
| `npm run db:studio` | Browse the database in Drizzle Studio |
| `npm test` | Unit tests (Vitest) |

## Roles

- **Super admin** — everything, including adding and removing staff.
- **Employee** — listings, leads, enquiries and locations; can't add or remove staff.
