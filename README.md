# TechJobs - Job Board Platform

A modern job board built with Next.js, Neon PostgreSQL, and deployed on Vercel with CI/CD via GitHub Actions.

## Live Demo

[https://job-board-tsuki.vercel.app](https://job-board-tsuki.vercel.app)

## Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 16 | Full-stack framework (React + API routes) |
| TypeScript | Type safety |
| Tailwind CSS | Styling & responsive design |
| Neon (PostgreSQL) | Database |
| Vercel | Hosting & deployment |
| GitHub Actions | CI/CD pipeline |

## Features

### 1. Browse Jobs
- View all posted jobs on the homepage as card-style listings
- Each card shows title, company, location, job type (badge), description preview, and salary range
- Click a card to view full job details

### 2. Search & Filter
- **Search bar** — filter jobs by title, company, or location in real-time
- **Job type filter** — filter by Full-time, Part-time, Contract, Remote, or Internship
- Search and filter work together (e.g., search "Google" + filter "Full-time")

### 3. Job Details Page
- Full job description with company info, location, type, and salary
- Requirements section
- Posted date
- Back navigation to job list

### 4. Post a Job
- Form with fields: title, company, location, job type, salary range, description, requirements
- Client-side validation for required fields
- On success, redirects to homepage showing the new listing

### 5. REST API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/jobs` | List all jobs (supports `?search=` and `?type=` query params) |
| GET | `/api/jobs/[id]` | Get single job by ID |
| POST | `/api/jobs` | Create a new job |
| GET | `/api/init` | Initialize database tables |

### 6. Responsive Design
- Works on desktop, tablet, and mobile
- Collapsible navigation on small screens

### 7. CI/CD Pipeline
- **GitHub Actions** workflow runs on every push to `main`
  - `npm ci` — clean install dependencies
  - `npm run lint` — ESLint type checking
  - `npm run build` — production build verification
- **Vercel** auto-deploys on every push to `main`

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

# Run database initialization
# Start the dev server and visit /api/init

# Start development server
npm run dev
```

## Database Schema

```sql
CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  salary_range VARCHAR(100),
  description TEXT NOT NULL,
  requirements TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Environment Variables

| Variable | Description |
|---|---|
| `POSTGRES_URL` | Neon PostgreSQL connection string |

## Project Structure

```
job-board/
├── app/
│   ├── api/
│   │   ├── init/route.ts      Database initialization
│   │   └── jobs/
│   │       ├── route.ts        List & create jobs
│   │       └── [id]/route.ts   Get job by ID
│   ├── jobs/[id]/page.tsx      Job detail page
│   ├── post/page.tsx           Post a job form
│   ├── layout.tsx              App layout with navbar
│   ├── page.tsx                Homepage with search/filter
│   └── globals.css             Global styles
├── db/index.ts                 Database connection & queries
├── .github/workflows/ci.yml    CI/CD pipeline
└── public/                     Static assets
```

## Related Links

- GitHub Repository: [https://github.com/nikhilmangali1/job-board](https://github.com/nikhilmangali1/job-board)
- Live Demo: [https://job-board-tsuki.vercel.app](https://job-board-tsuki.vercel.app)
