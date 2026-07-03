import { useMemo } from "react";
import { computeAllCompanyProfiles, type CompanyProfile } from "@/lib/companyAnalytics";
import type { Job } from "@/lib/analytics";

export default function useCompanyAnalytics(jobs: Job[]) {
  const profiles = useMemo(() => computeAllCompanyProfiles(jobs), [jobs]);

  const getProfile = useMemo(
    () => (companyName: string): CompanyProfile | undefined => profiles.get(companyName.toLowerCase()),
    [profiles],
  );

  return { profiles, getProfile };
}
