# Capital Youth Expo 2026

Marketing site for **Capital Youth Expo (CYE) 2026**, Islamabad’s largest youth engagement expo. The site sells sponsorships and stalls, and drives competition, campus ambassador, and volunteer registrations.

**18 November 2026 · Pak-China Friendship Center, Islamabad**  
Organized by SAFE in collaboration with Youth Insight (YI)

Live domain: [capitalyouthexpo.com](https://capitalyouthexpo.com)

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Framer Motion
- lucide-react
- PostgreSQL (Neon) with Drizzle ORM, Resend for email, Vercel Blob for admin photo uploads
- Pages are prerendered and refreshed automatically when content changes in the admin dashboard

## Setup

Requires Node.js 20+.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Script        | Purpose              |
| ------------- | -------------------- |
| `npm run dev` | Local development    |
| `npm run build` | Production build   |
| `npm start`   | Serve the production build |
| `npm run lint` | ESLint              |

Deploy on Vercel from this repo. See **Backend & admin dashboard** below for the environment variables.

## Pages

| Path            | Purpose                                                        |
| --------------- | -------------------------------------------------------------- |
| `/`             | Homepage: event story, guests, sponsorship                     |
| `/competitions` | Competition catalog (filter by vertical) + team registration   |
| `/projects`     | Project Exhibition: prize pool + project submission            |
| `/startups`     | Startup Arena: investor pitch submission                       |
| `/visitors`     | Visitor pass registration                                      |
| `/ambassadors`  | Campus Ambassador application                                  |
| `/volunteers`   | Volunteer roles + sign-up                                      |
| `/contact`      | Department contacts, venue, message form                       |

`/competition`, `/ambassador`, `/volunteer`, `/project`, `/startup`, and `/visitor` redirect to the plural routes; `/register` redirects to `/competitions`.

Registrations are opened and closed from **Admin → Settings**; a closed form shows a "registration closed" notice.

Competition fees and team sizes, project prizes, contact phone numbers, and social links in `data/event.ts` are **placeholders** (marked `PLACEHOLDER`). Replace them with confirmed details.

Every form posts to `/api/submissions`, is validated on the server (`lib/submissions.ts`), saved to Postgres, and triggers two emails: one to the team inbox and a confirmation to the applicant.

## Project layout

```
app/            Routes, metadata, global styles
components/     Page sections and UI primitives
data/event.ts   Dates, copy, guests, tiers, competitions
lib/            Content getters, DB client + schema, auth, email, form validation
lib/admin/      Admin dashboard config (content types, labels, queries)
app/admin/      Admin dashboard (login, submissions, content, settings, admins)
app/api/        Submissions endpoint
drizzle/        SQL migrations
scripts/        db-setup (migrate, seed, first admin)
public/         Logo, gallery placeholders, guest photos
```

Competitions, guests, advisory board, team, sponsorship/stall packages, contacts, inboxes, social links and registration switches are edited in the **admin dashboard**. `data/event.ts` holds the event basics and the defaults used to seed the database (and served when no database is configured). Brand colors live in **`app/globals.css`**.

## Assets

All images come from the CYE 2026 sponsorship proposal. Replace a file in place to update it.

| Asset                   | Location                                                                 |
| ----------------------- | ------------------------------------------------------------------------ |
| CYE emblem / full logo  | `public/brand/cye-emblem.png`, `public/brand/cye-logo.png`                |
| Youth Insight logo      | `public/brand/youth-insight.png`                                          |
| Favicon / Apple icon    | `app/icon.png`, `app/apple-icon.png`                                      |
| Gallery photos          | `public/gallery/01.webp` to `14.webp` (alt text in `components/Gallery.tsx`) |
| Guest portraits         | `public/guests/<slug>.webp`, linked via `photo` in `GUESTS`               |
| Board of Advisory       | `public/advisory/<slug>.webp`, data in `ADVISORY_BOARD`                   |
| Venue photo             | `public/venue/pak-china-friendship-center.webp`                           |
| Floor plans             | `public/venue/floor-plan-ground.webp`, `public/venue/floor-plan-first.webp` (zones in `VENUE`) |
| Director photo          | `public/team/hashir-ijaz-abbasi.webp`                                     |
| Team photos             | `public/team/<slug>.webp`, data in `TEAM` (first two are featured)        |
| Hero background         | `public/venue/auditorium.webp`                                            |

`CYE - Proposal.pdf` is gitignored and stays local.

## Backend & admin dashboard

### One-time setup on Vercel

1. **Database:** Vercel project → Storage → add **Neon Postgres** and connect it to the project. This sets `DATABASE_URL`.
2. **Environment variables** (Project → Settings → Environment Variables), see `.env.example`:
   - `AUTH_SECRET`: a random string of 32+ characters (`openssl rand -base64 48`).
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD`: the first admin login.
   - `RESEND_API_KEY`, `EMAIL_FROM`: from [Resend](https://resend.com), with `capitalyouthexpo.com` verified as a sending domain.
   - `SITE_URL`: `https://capitalyouthexpo.com`, so logos and links in emails always point at the live site.
   - Optional: Storage → add a **public Blob** store for photo uploads and connect it to the project (sets `BLOB_STORE_ID`, or `BLOB_READ_WRITE_TOKEN` on older stores), then redeploy.
3. **Redeploy.** The build runs `scripts/db-setup.ts`, which applies migrations, seeds all site content into empty tables, and creates the first admin.
4. Sign in at **`/admin`**, then add the rest of the team under **Admins** and change your password.

### What the dashboard does

| Area | Purpose |
| ---- | ------- |
| Overview | Totals, new submissions per form, latest activity |
| Submissions | Filter by form/status, search, bulk status changes, CSV export; each submission has contact shortcuts (email, call, WhatsApp), team members, status and internal notes |
| Site content | Add, edit, reorder, hide or delete competitions, guests, advisory board, team, sponsorship & stall packages, contacts (with photo upload) |
| Settings | Open/close each registration, notification inboxes, social links |
| Admins | Add/remove admins, change password |

### Local development

```bash
cp .env.example .env.local   # fill in DATABASE_URL (any Postgres) and AUTH_SECRET
npm run db:setup             # migrate + seed + first admin
npm run dev
```

Schema lives in `lib/db/schema.ts`. After changing it, run `npm run db:generate` and commit the new file in `drizzle/`; it is applied on the next deploy.

Without `DATABASE_URL` the site still builds and shows the content from `data/event.ts`; forms reply that submissions are temporarily unavailable.
