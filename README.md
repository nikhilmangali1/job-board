# TechJobs — AI-Powered Job Board Platform

A full-stack job board built with **Next.js 16** and **Neon (serverless PostgreSQL)**, featuring AI-assisted resume matching, a command palette, market insights dashboard, and company intelligence cards. Deployed on **Vercel** with a **GitHub Actions CI/CD pipeline**.

- **Live Demo:** [https://job-board-tsuki.vercel.app](https://job-board-tsuki.vercel.app)
- **Repository:** [https://github.com/nikhilmangali1/job-board](https://github.com/nikhilmangali1/job-board)

---

## Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 16 (App Router) | Full-stack framework — React frontend + API routes |
| React 19 | UI library |
| TypeScript | Type safety across app, API, and lib layers |
| Tailwind CSS v4 | Styling, responsive design, dark mode |
| Neon (serverless PostgreSQL) | Database, accessed via tagged-template SQL |
| Vercel | Hosting and deployment |
| GitHub Actions | CI/CD pipeline (lint + build + deploy) |

---

## Features

### 1. Job Browsing & Search
- Card-based job listings with title, company, location, type badge, salary range, and description preview.
- Real-time search across title, company, and location (debounced).
- Filters: job type, location, minimum salary, remote-only toggle, company name.
- Sort by newest, oldest, salary, or **Best Match** (when a resume is loaded).
- All filters and sort encoded in URL query parameters — shareable via a plain link.
- Popular search tags with one-click filtering.

### 2. Job Details Page
- Full description, requirements, company, location, type, salary, and posted date.
- "Apply Now" button linking to an external application URL.
- Match badge and expandable matched/missing skills breakdown (when resume is loaded).
- Company hover card with hiring activity, average salary, and technologies.
- Automatically added to "Recently Viewed" on load.

### 3. Post a Job
- 8-field form: title, company, location, type, salary, description, requirements, apply URL.
- Completion progress bar with real-time percentage.
- Smart suggestions (title length, salary inclusion, URL validity).
- Live preview sidebar.
- Description character counter (1000 max) with paste truncation.
- Draft auto-save to localStorage.
- Preview modal with focus trapping, escape-to-close, and scroll lock.

### 4. AI-Assisted Resume Matching
- Paste resume text or upload a `.txt` file.
- 121 skills across 7 categories — matched via case-insensitive substring matching.
- Weighted scoring: title skills = 3×, requirements = 2×, description = 1×.
- Color-coded badge: green ≥80%, amber ≥50%, red <50%.
- Expandable panel showing matched vs. missing skills.
- "Best Match" sort and "80%+ match only" filter.
- **Privacy:** resume data stays in localStorage — never sent to any server.

### 5. Command Palette (⌘K / Ctrl+K)
- 16 commands: browse jobs, post, toggle dark mode, filter by type, clear filters, sort options, focus search, clear recently viewed, clear resume, market insights, analyze resume.
- Fuzzy search across command labels and keywords.
- Live job search with fuzzy token matching (max 8 results).
- Full keyboard navigation (arrow keys, Enter, Escape) with auto-scroll.
- Recently used commands tracked and surfaced at top.
- Rich job results with copy-link and save actions.

### 6. Recently Viewed Jobs
- Last 10 jobs tracked client-side and shown as a strip on the homepage.
- Each entry shows company initials, title, company, location, match badge, type badge, and relative viewed time.
- Clearable from UI or command palette.

### 7. Market Insights Dashboard (`/analytics`)
- Server-rendered page with fresh data on every visit.
- Stats overview with animated count-up numbers.
- Tech trends bar chart (top 10 skills).
- Salary distribution bar chart (bucketed ranges).
- Location heatmap (top 8 cities).
- AI Insights cards with natural-language summaries.
- Hiring insights (most common type, top company, remote percentage).

### 8. Company Hover Cards
- Hover any company name to see hiring activity, open roles, average salary, technologies, and locations.
- Deterministic gradient avatar from company name hash.
- Smart positioning (below/above based on viewport).
- 150ms show / 200ms hide delay prevents flickering.

### 9. Theme System
- Dark/light mode toggle persisted to localStorage.
- No flash-of-wrong-theme — class applied synchronously on load.
- 30+ design tokens with dark mode overrides.

### 10. REST API

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/jobs` | List jobs with search, type, location, minSalary, remote, company, sort params |
| `GET` | `/api/jobs/[id]` | Fetch a single job by ID |
| `POST` | `/api/jobs` | Create a new job listing (validates required fields) |
| `GET` | `/api/analytics/summary` | Aggregate stats for dashboard preview |
| `GET` | `/api/init` | Idempotently create the `jobs` table |

### 11. CI/CD Pipeline
- **GitHub Actions** (`.github/workflows/ci.yml`):
  - `quality` job: `npm ci` → `npm run lint` → `npm run build` (every push/PR)
  - `deploy` job: Vercel CLI pull → build → deploy to production (push to `main` only, after quality passes)
- Deploy happens **through the pipeline** using `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.

---

## Local Development

```bash
# Clone the repo
git clone https://github.com/nikhilmangali1/job-board.git
cd job-board

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Neon PostgreSQL connection string

# Start the dev server, then visit /api/init once to create the jobs table
npm run dev
```

---

## Database Schema

```sql
CREATE TABLE IF NOT EXISTS jobs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  salary_range VARCHAR(100),
  description TEXT NOT NULL,
  requirements TEXT,
  apply_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `POSTGRES_URL` | Neon PostgreSQL connection string (see `.env.example`) |

---

## Project Structure

```
job-board/
├── app/
│   ├── api/
│   │   ├── init/route.ts              Database initialization
│   │   ├── analytics/summary/route.ts Aggregate stats for dashboard
│   │   └── jobs/
│   │       ├── route.ts                List & create jobs
│   │       └── [id]/route.ts           Get job by ID
│   ├── analytics/page.tsx              Market Insights Dashboard (SSR)
│   ├── jobs/[id]/page.tsx              Job detail page
│   ├── post/page.tsx                   Job posting form
│   ├── components/
│   │   ├── CommandPalette/             ⌘K command palette
│   │   ├── CompanyHoverCard/           Company hover cards
│   │   ├── InsightsDashboard/          Charts, stats, AI insights
│   │   ├── ui/                         Shared primitives (Button, Card, Input, etc.)
│   │   ├── JobCard.tsx                 Job listing card with match display
│   │   ├── MatchBadge.tsx              SVG circular match score indicator
│   │   ├── MatchDetails.tsx            Expandable matched/missing skills
│   │   ├── SkillChip.tsx               Individual skill chip
│   │   ├── ResumeAnalyzer.tsx          Resume paste/upload UI
│   │   ├── RecentlyViewed.tsx          Recently viewed jobs strip
│   │   ├── PostJobPreview.tsx          Live preview for post form
│   │   ├── PreviewModal.tsx            Full preview modal with focus trap
│   │   ├── InsightsPreview.tsx         Homepage analytics preview
│   │   ├── Toast.tsx                   Toast notification
│   │   ├── ScrollToTop.tsx             Route-change scroll reset
│   │   └── SkeletonCard/Detail.tsx     Loading placeholders
│   ├── ThemeProvider.tsx               Theme context
│   ├── ThemeToggle.tsx                 Dark/light toggle
│   ├── NavClient.tsx                   Navigation client component
│   ├── layout.tsx                      Root layout with nav
│   ├── page.tsx                        Homepage (dashboard layout)
│   └── globals.css                     Design system & Tailwind
├── db/index.ts                         Neon query helper & database init
├── hooks/
│   ├── useCommandPalette.ts            ⌘K keyboard shortcut listener
│   ├── useKeyboardNavigation.ts        Arrow key navigation hook
│   ├── useRecentlyViewedJobs.ts        Recently viewed state hook
│   ├── useRecentCommands.ts            Palette recent items
│   └── useCompanyAnalytics.ts          Company profile computation
├── lib/
│   ├── analytics.ts                    Stats, trends, salary, location, AI insights
│   ├── companyAnalytics.ts             Per-company hiring profiles
│   ├── jobMatcher.ts                   Weighted resume-to-job matching
│   ├── resumeParser.ts                 Resume persistence & React hook
│   ├── skillDictionary.ts              121 skills across 7 categories
│   ├── salaryParser.ts                 Salary parsing and formatting
│   ├── fuzzySearch.ts                  Token matching and text highlighting
│   ├── jobsCache.ts                    In-memory job cache (30s TTL)
│   ├── commandRegistry.tsx             16 command definitions & filtering
│   ├── recentStorage.ts                Palette recent items persistence
│   ├── recentlyViewedStorage.ts        Recently viewed persistence
│   └── utils.ts                        Date formatting, initials, type styles
├── .github/workflows/ci.yml            CI/CD pipeline (lint + build + deploy)
├── next.config.ts                      Next.js configuration
├── tsconfig.json                       TypeScript configuration
├── package.json                        Dependencies and scripts
├── postcss.config.mjs                  PostCSS configuration
└── eslint.config.mjs                   ESLint flat configuration
```

## Accessibility

- ARIA labels, live regions, roles on all interactive elements.
- Skip-to-content link, keyboard-navigable dialogs, focus trapping in modals.
- Dark/light theme with no flash-of-wrong-theme.
- Toast notifications for actions (post job, save, copy).

## Related Links

- GitHub Repository: [https://github.com/nikhilmangali1/job-board](https://github.com/nikhilmangali1/job-board)
- Live Demo: [https://job-board-tsuki.vercel.app](https://job-board-tsuki.vercel.app)
- Documentation: [DOCUMENTATION.md](DOCUMENTATION.md)
- CI/CD Pipeline: [GitHub Actions](https://github.com/nikhilmangali1/job-board/actions)
