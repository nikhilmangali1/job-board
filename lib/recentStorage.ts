const RECENT_KEY = "techjobs_palette_recent";
const MAX_ITEMS = 5;

export type RecentItem = {
  type: "command" | "job" | "search";
  id: string;
  label: string;
  timestamp: number;
};

export function loadRecent(): RecentItem[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (i): i is RecentItem =>
        typeof i === "object" && i !== null && ["command", "job", "search"].includes(i.type) && typeof i.id === "string" && typeof i.label === "string"
    );
  } catch {
    return [];
  }
}

export function saveRecent(items: RecentItem[]): void {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
  } catch { /* ignore */ }
}

export function addRecent(items: RecentItem[], item: RecentItem): RecentItem[] {
  const filtered = items.filter((i) => !(i.type === item.type && i.id === item.id));
  const updated = [item, ...filtered].slice(0, MAX_ITEMS);
  saveRecent(updated);
  return updated;
}

export function clearRecent(): void {
  try {
    localStorage.removeItem(RECENT_KEY);
  } catch { /* ignore */ }
}
