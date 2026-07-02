"use client";

import { useCallback, useState } from "react";
import { loadRecent, saveRecent, addRecent, type RecentItem } from "@/lib/recentStorage";

export default function useRecentCommands() {
  const [items, setItems] = useState<RecentItem[]>(() => loadRecent());

  const add = useCallback((item: { type: string; id: string; label: string }) => {
    const recentItem: RecentItem = { ...item, timestamp: Date.now() } as RecentItem;
    setItems((prev) => {
      const updated = addRecent(prev, recentItem);
      saveRecent(updated);
      return updated;
    });
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    try { localStorage.removeItem("techjobs_palette_recent"); } catch { /* ignore */ }
  }, []);

  return { recentItems: items, addRecent: add, clearRecent: clear };
}
