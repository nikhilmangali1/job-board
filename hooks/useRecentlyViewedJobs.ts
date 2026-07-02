"use client";

import { useCallback, useEffect, useState } from "react";
import { loadRecentlyViewed, addRecentlyViewed, clearRecentlyViewed as clearStorage, type RecentlyViewedJob } from "@/lib/recentlyViewedStorage";

export default function useRecentlyViewedJobs() {
  const [jobs, setJobs] = useState<RecentlyViewedJob[]>(() => loadRecentlyViewed());

  useEffect(() => {
    const handler = () => {
      setJobs([]);
      clearStorage();
    };
    window.addEventListener("app:clearRecentlyViewed", handler);
    return () => window.removeEventListener("app:clearRecentlyViewed", handler);
  }, []);

  const addJob = useCallback((job: Omit<RecentlyViewedJob, "viewed_at">) => {
    setJobs((prev) => addRecentlyViewed(prev, job));
  }, []);

  const clearJobs = useCallback(() => {
    setJobs([]);
    clearStorage();
  }, []);

  return { recentlyViewed: jobs, addJob, clearJobs };
}
