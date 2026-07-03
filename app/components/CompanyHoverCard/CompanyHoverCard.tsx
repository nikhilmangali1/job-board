"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CompanyProfile } from "@/lib/companyAnalytics";
import CompanyHeader from "./CompanyHeader";
import CompanyStats from "./CompanyStats";
import CompanyTechnologies from "./CompanyTechnologies";

type Props = {
  profile?: CompanyProfile;
  children: React.ReactNode;
};
export default function CompanyHoverCard({ profile, children }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [cardStyle, setCardStyle] = useState<React.CSSProperties>({});
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const isHoveringRef = useRef(false);

  const calcPosition = useCallback(() => {
    if (!triggerRef.current) return null;
    const rect = triggerRef.current.getBoundingClientRect();
    const cardWidth = 288;
    const cardHeight = 320;
    const spaceBelow = window.innerHeight - rect.bottom;
    const showBelow = spaceBelow >= cardHeight || spaceBelow >= rect.top;
    const top = showBelow ? rect.bottom : rect.top - cardHeight;
    let left = rect.left + rect.width / 2 - cardWidth / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - cardWidth - 8));
    return { top, left };
  }, []);

  const cleanClose = useCallback(() => {
    setIsOpen(false);
    isHoveringRef.current = false;
  }, []);

  const clearTimers = useCallback(() => {
    if (showTimer.current) { clearTimeout(showTimer.current); showTimer.current = null; }
    if (hideTimer.current) { clearTimeout(hideTimer.current); hideTimer.current = null; }
  }, []);

  const handleShow = useCallback(() => {
    clearTimers();
    if (isHoveringRef.current) return;
    isHoveringRef.current = true;
    showTimer.current = setTimeout(() => {
      const pos = calcPosition();
      if (pos) setCardStyle(pos);
      setIsOpen(true);
    }, 150);
  }, [clearTimers, calcPosition]);

  const handleHide = useCallback(() => {
    clearTimers();
    hideTimer.current = setTimeout(() => {
      cleanClose();
    }, 200);
  }, [clearTimers, cleanClose]);

  const handleCardEnter = useCallback(() => {
    if (hideTimer.current) { clearTimeout(hideTimer.current); hideTimer.current = null; }
    isHoveringRef.current = true;
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onScroll = () => cleanClose();
    window.addEventListener("scroll", onScroll, true);
    return () => window.removeEventListener("scroll", onScroll, true);
  }, [isOpen, cleanClose]);

  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  const handleBrowse = useCallback(() => {
    if (profile) {
      window.location.href = `/?company=${encodeURIComponent(profile.company)}`;
    }
  }, [profile]);

  const companyKey = profile ? profile.company.replace(/\s+/g, "-").toLowerCase() : "unknown";
  const triggerId = `company-trigger-${companyKey}`;
  const cardId = `company-card-${companyKey}`;

  if (!profile) return <>{children}</>;

  return (
    <span
      ref={triggerRef}
      className="relative inline-flex"
      onPointerEnter={handleShow}
      onPointerLeave={handleHide}
      onFocus={handleShow}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          handleHide();
        }
      }}
      aria-describedby={isOpen ? cardId : undefined}
      role="button"
      tabIndex={0}
      id={triggerId}
    >
      {children}

      {isOpen && (
        <div
          ref={cardRef}
          id={cardId}
          role="tooltip"
          style={{ ...cardStyle, transform: "scale(1)", transition: "opacity 150ms ease-out, transform 150ms ease-out" }}
          className="fixed z-50 w-72 p-4 rounded-xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200 dark:border-gray-700 shadow-2xl dark:shadow-gray-900/60 opacity-100"
          onPointerEnter={handleCardEnter}
          onPointerLeave={handleHide}
        >
          <CompanyHeader company={profile.company} jobCount={profile.jobCount} activity={profile.hiringActivity} />
          <CompanyStats
            avgSalary={profile.avgSalary}
            locationCount={profile.hiringLocations.length}
            mostCommonJobType={profile.mostCommonJobType}
            remoteFraction={profile.remoteFraction}
          />
          <CompanyTechnologies technologies={profile.topTechnologies} />
          <button
            onClick={handleBrowse}
            className="btn btn-primary btn-sm w-full"
          >
            Browse Company Jobs
          </button>
        </div>
      )}
    </span>
  );
}
