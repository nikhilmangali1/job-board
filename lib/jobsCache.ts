type CachedJob = {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  salary_range: string | null;
  description: string;
  requirements: string | null;
  created_at: string;
};

let cache: CachedJob[] | null = null;
let cacheTimestamp = 0;
const TTL = 30000;

export async function getCachedJobs(): Promise<CachedJob[]> {
  if (cache && Date.now() - cacheTimestamp < TTL) {
    return cache;
  }
  try {
    const res = await fetch("/api/jobs");
    const data: CachedJob[] = await res.json();
    cache = data;
    cacheTimestamp = Date.now();
    return data;
  } catch {
    return cache ?? [];
  }
}
