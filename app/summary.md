## Anchored Summary (last updated: after AI Resume Match integration)

## Goal
Build a job board with AI Resume Match using Next.js 16 + Neon Postgres + Tailwind CSS v4, with CI/CD and full accessibility.

## Constraints
- No commits by assistant.
- Entirely client-side Resume Match — no DB/API changes.
- Preserve all existing functionality.
- Follow existing code style (Tailwind v4 dark variant, `"use client"`, wrapped setState for ESLint rule).
- All `setState` in `useEffect` wrapped in `setTimeout(0)` or async callbacks.

## Progress
### Done
- Dark/light mode, hydration fix, lazy localStorage initializer.
- Skeleton loading, relative dates, filter pills, colored type badges, company initials avatar, animated page transitions, success toast, search debounce, empty state.
- Sort (newest/oldest/salary), job count, clear search, inline validation, spinning loader, favicon SVG.
- Apply Now button, collapsible filter panel (location, min salary, remote toggle), draft save to localStorage, preview modal, char counter, skip-to-content, ScrollToTop, ARIA attributes.
- Sharable URL state for all filters/sort.
- DB migration: `apply_url` column.
- **AI Resume Match**: skill dictionary (7 categories, 80+ skills), `extractSkills()`/`saveResume()`/`loadResume()`, `computeMatch()` (×3 title, ×2 requirements, ×1 description).
- **Components**: `ResumeAnalyzer` (paste/upload with `aria-live`), `MatchBadge` (SVG ring, green≥80/yellow≥50/red<50), `SkillChip` (matched/missing), `MatchDetails` (expandable).
- **Homepage** (`page.tsx`): ResumeAnalyzer above search, Best Match sort option, 80%+ match filter pill, MatchBadge on cards, MatchDetails expandable under description, match computed in fetch `.then()`.
- **Job detail** (`app/jobs/[id]/page.tsx`): loads resume from localStorage, computes match via `useMemo`, displays MatchBadge + MatchDetails.
- **Command Palette** (`Ctrl+K`/`Cmd+K`): 14 commands (browse, post, dark mode, remote/full-time/internship/contract filters, clear filters, sort by best match/salary/newest, focus search, clear recently viewed, clear resume, analyze resume), keyboard navigation (arrow keys, Enter, Escape), fuzzy search across labels + keywords, recent items in localStorage (`command_palette_recent`), ARIA dialog/combobox pattern.
- **Recently Viewed Jobs**: `recentlyViewedStorage` lib (`lib/recentlyViewedStorage.ts`), max 10 items in localStorage, `RecentlyViewed` component on homepage (horizontal scroll with 5 cards, relative date, type badge, initials avatar), save on job detail page mount (`app/jobs/[id]/page.tsx`), clear event listener (`app:clearRecentlyViewed`).
- **Insights Dashboard** (`/analytics`): server component fetching all jobs via `@/db`, computed analytics via `lib/analytics.ts` (`computeStats`, `computeHiringInsights`, `computeTechTrends`, `computeSalaryDistribution`, `computeLocationHeatmap`, `computeAIInsights`), `InsightsDashboard` client component with stat cards (total jobs, unique companies, avg salary, highest salary) + `TechTrends`/`SalaryDistribution`/`LocationHeatmap` bar charts + `AIInsights` cards.
- Command Palette command for navigating to `/analytics` ("Market Insights").
- Build passes (`npx next build` — TS + compilation OK).

### Bug Fixes
- Hydration error in job detail page: nested `<button>` inside `<Link>` fixed by replacing `onClick` navigation with `<Link>`.
- "Clear Resume" command now properly clears state and shows toast via custom event `app:clearResume`.
- Search token matching: `tokenMatch` in `fuzzySearch.ts` now uses `String.includes` on lowercased text, handles null/undefined/empty gracefully.
- `extractSkills` moved from `resumeParser.ts` (client module with React hooks) to `skillDictionary.ts` (pure module) so server components can import it without taint.

### In Progress
- (none)

### Blocked
- (none)

### Not Started Yet
- (none)

## Key Decisions
- Resume Match entirely client-side: localStorage (`techjobs_resume` + `techjobs_resume_skills`), no API/DB changes.
- `extractSkills()` uses `String.includes()` on lowercased text vs dictionary.
- Match computed in fetch `.then()` (homepage) and `useMemo` (detail page) — avoids extra renders.
- 80%+ filter is client-side on `displayJobs` array.
- "bestmatch" sort not sent to API (returns default order), frontend sorts computed results.
- `ResumeAnalyzer` saves to localStorage and calls `onAnalyze(text, skills)` — parent updates state from callback.
- MatchDetails shows below card description on homepage, in a highlighted section on detail page.

## Next Steps
- Run lint check (`npm run lint`).
- User to test locally, then commit + push.

