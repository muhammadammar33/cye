# Capital Youth Expo 2026

Marketing site for **Capital Youth Expo (CYE) 2026** — Islamabad’s largest youth engagement expo. The site sells sponsorships and stalls, and drives competition, campus ambassador, and volunteer registrations.

**18 November 2026 · Pak-China Friendship Center, Islamabad**  
Organized by SAFE in collaboration with Youth Insight (YI)

Live domain: [capitalyouthexpo.com](https://capitalyouthexpo.com)

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Framer Motion
- lucide-react
- Static / SSG — no backend in v1

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

Deploy on Vercel from this repo. No environment variables are required for v1.

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

Each form can be closed without code changes elsewhere: set its flag in `REGISTRATION_OPEN` (`data/event.ts`) to `false` and the page shows a "registration closed" notice instead.

Competition fees and team sizes, project prizes, contact phone numbers, and social links in `data/event.ts` are **placeholders** (marked `PLACEHOLDER`) — replace them with confirmed details.

Forms currently open a `mailto:` draft. Swap that for a real POST when an API exists — search for `TODO` in `components/ui/InterestForm.tsx`, `components/competitions/TeamRegistrationForm.tsx`, and `components/ContactCTA.tsx`.

## Project layout

```
app/            Routes, metadata, global styles
components/     Page sections and UI primitives
data/event.ts   Dates, copy, guests, tiers, competitions
lib/            Shared helpers (cn, mailto)
public/         Logo, gallery placeholders, guest photos
```

Edit **`data/event.ts`** for dates, sponsorship prices, guest list, competitions (fees, team sizes), prizes, contacts, and which forms are open. Brand colors live in **`app/globals.css`**.

## Assets

Drop real files over the placeholders:

| Asset           | Location                                      |
| --------------- | --------------------------------------------- |
| Logo            | `public/logo.svg`                             |
| Gallery photos  | `public/gallery/` (replace `01.svg`–`08.svg`) |
| Guest portraits | `public/guests/` then wire paths in `Guests.tsx` |

`CYE - Proposal.pdf` is gitignored and stays local.
