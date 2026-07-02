const STORAGE_KEY = "techjobs_recently_viewed";
const MAX_ITEMS = 10;

export type RecentlyViewedJob = {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  salary_range: string | null;
  description: string;
  requirements: string | null;
  created_at: string;
  viewed_at: number;
};

export function loadRecentlyViewed(): RecentlyViewedJob[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (i): i is RecentlyViewedJob =>
        typeof i === "object" && i !== null && typeof i.id === "number" && typeof i.title === "string"
    );
  } catch {
    return [];
  }
}

export function saveRecentlyViewed(jobs: RecentlyViewedJob[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs.slice(0, MAX_ITEMS)));
  } catch { /* ignore */ }
}

export function addRecentlyViewed(jobs: RecentlyViewedJob[], job: Omit<RecentlyViewedJob, "viewed_at">): RecentlyViewedJob[] {
  const filtered = jobs.filter((j) => j.id !== job.id);
  const updated = [{ ...job, viewed_at: Date.now() }, ...filtered].slice(0, MAX_ITEMS);
  saveRecentlyViewed(updated);
  return updated;
}

export function clearRecentlyViewed(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch { /* ignore */ }
}
