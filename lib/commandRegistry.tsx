import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export type Theme = "light" | "dark";

export type CommandContext = {
  router: AppRouterInstance;
  theme: Theme;
  toggleTheme: () => void;
  close: () => void;
  addRecent: (item: { type: string; id: string; label: string }) => void;
};

export type Command = {
  id: string;
  label: string | ((ctx: CommandContext) => string);
  description: string | ((ctx: CommandContext) => string);
  keywords: string[];
  icon: React.ReactNode;
  execute: (ctx: CommandContext) => void;
};

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><circle cx="4" cy="11" r="2"/><circle cx="12" cy="10" r="2"/><circle cx="20" cy="14" r="2"/></svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
  );
}

function FileTextIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  );
}

export const COMMANDS: Command[] = [
  {
    id: "browse",
    label: "Browse Jobs",
    description: "View all available job listings",
    keywords: ["browse", "jobs", "all", "listings", "view"],
    icon: <SearchIcon />,
    execute: (ctx) => { ctx.router.push("/"); ctx.close(); },
  },
  {
    id: "post",
    label: "Post a Job",
    description: "Create a new job listing",
    keywords: ["post", "create", "new", "listing", "add"],
    icon: <PlusIcon />,
    execute: (ctx) => { ctx.router.push("/post"); ctx.close(); },
  },
  {
    id: "dark-mode",
    label: ctx => `Toggle ${ctx.theme === "dark" ? "Light" : "Dark"} Mode`,
    description: ctx => ctx.theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
    keywords: ["dark", "light", "mode", "theme", "toggle"],
    icon: <MoonIcon />,
    execute: (ctx) => { ctx.toggleTheme(); ctx.close(); },
  },
  {
    id: "remote",
    label: "Show Remote Jobs",
    description: "Filter to show only remote positions",
    keywords: ["remote", "filter", "wfh", "work from home", "remote jobs"],
    icon: <FilterIcon />,
    execute: (ctx) => { ctx.router.push("/?type=Remote"); ctx.close(); },
  },
  {
    id: "fulltime",
    label: "Show Full-time Jobs",
    description: "Filter to show only full-time positions",
    keywords: ["full", "time", "full-time", "filter", "fulltime"],
    icon: <FilterIcon />,
    execute: (ctx) => { ctx.router.push("/?type=Full-time"); ctx.close(); },
  },
  {
    id: "internship",
    label: "Show Internships",
    description: "Filter to show only internship positions",
    keywords: ["intern", "internship", "filter"],
    icon: <FilterIcon />,
    execute: (ctx) => { ctx.router.push("/?type=Internship"); ctx.close(); },
  },
  {
    id: "contract",
    label: "Show Contracts",
    description: "Filter to show only contract positions",
    keywords: ["contract", "contractor", "filter"],
    icon: <FilterIcon />,
    execute: (ctx) => { ctx.router.push("/?type=Contract"); ctx.close(); },
  },
  {
    id: "clear-filters",
    label: "Clear Filters",
    description: "Reset all search filters and sorting",
    keywords: ["clear", "reset", "filters", "all", "remove"],
    icon: <TrashIcon />,
    execute: (ctx) => { ctx.router.push("/"); ctx.close(); },
  },
  {
    id: "sort-bestmatch",
    label: "Sort by Best Match",
    description: "Sort jobs by AI resume match score",
    keywords: ["sort", "best", "match", "resume", "ai"],
    icon: <ArrowUpIcon />,
    execute: (ctx) => { ctx.router.push("/?sort=bestmatch"); ctx.close(); },
  },
  {
    id: "sort-salary",
    label: "Sort by Salary",
    description: "Sort jobs by salary (high to low)",
    keywords: ["sort", "salary", "pay", "compensation", "high"],
    icon: <ArrowUpIcon />,
    execute: (ctx) => { ctx.router.push("/?sort=salary"); ctx.close(); },
  },
  {
    id: "sort-newest",
    label: "Sort by Newest",
    description: "Sort jobs by most recent first",
    keywords: ["sort", "newest", "recent", "latest", "date"],
    icon: <ClockIcon />,
    execute: (ctx) => { ctx.router.push("/?sort=newest"); ctx.close(); },
  },
  {
    id: "focus-search",
    label: "Focus Homepage Search",
    description: "Jump to the homepage search bar",
    keywords: ["focus", "search", "home", "jump", "goto"],
    icon: <SearchIcon />,
    execute: (ctx) => { ctx.router.push("/?focusSearch=true"); ctx.close(); },
  },
  {
    id: "clear-resume",
    label: "Clear Resume",
    description: "Remove your uploaded resume and match data",
    keywords: ["clear", "resume", "remove", "delete", "match"],
    icon: <TrashIcon />,
    execute: (ctx) => {
      window.dispatchEvent(new CustomEvent("app:clearResume"));
      ctx.close();
    },
  },
  {
    id: "analyze-resume",
    label: "Analyze Resume",
    description: "Upload or paste your resume to see job matches",
    keywords: ["analyze", "resume", "upload", "paste", "match", "ai"],
    icon: <FileTextIcon />,
    execute: (ctx) => { ctx.router.push("/?analyzeResume=true"); ctx.close(); },
  },
];

type ResolvedCommand = {
  id: string;
  label: string;
  description: string;
  keywords: string[];
  icon: React.ReactNode;
  execute: (ctx: CommandContext) => void;
};

export function getFilteredCommands(query: string, theme: Theme): ResolvedCommand[] {
  const q = query.toLowerCase();
  const ctx = { theme } as CommandContext;
  return COMMANDS.map((cmd) => ({
    id: cmd.id,
    label: typeof cmd.label === "function" ? cmd.label(ctx) : cmd.label,
    description: typeof cmd.description === "function" ? cmd.description(ctx) : cmd.description,
    keywords: cmd.keywords,
    icon: cmd.icon,
    execute: cmd.execute,
  })).filter((cmd) => {
    if (!q) return true;
    return (
      cmd.label.toLowerCase().includes(q) ||
      cmd.keywords.some((k) => k.toLowerCase().includes(q))
    );
  });
}
