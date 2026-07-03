"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import useCommandPalette from "@/hooks/useCommandPalette";
import ThemeToggle from "@/app/ThemeToggle";
import PaletteTip from "./PaletteTip";

const CommandPalette = dynamic(() => import("./CommandPalette/CommandPalette"), {
  ssr: false,
});

const TIP_KEY = "techjobs_palette_tip_shown";

export default function NavClient() {
  const { isOpen, open, close } = useCommandPalette();
  const [isMac, setIsMac] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const tipDismissed = useRef(false);

  useEffect(() => {
    const mac = typeof navigator !== "undefined" && navigator.platform.toLowerCase().includes("mac");
    setTimeout(() => setIsMac(mac), 0);
  }, []);

  useEffect(() => {
    if (tipDismissed.current) return;
    try {
      const shown = localStorage.getItem(TIP_KEY);
      if (!shown) setTimeout(() => setShowTip(true), 0);
    } catch { /* ignore */ }
  }, []);

  const dismissTip = useCallback(() => {
    setShowTip(false);
    tipDismissed.current = true;
    try { localStorage.setItem(TIP_KEY, "1"); } catch { /* ignore */ }
  }, []);

  return (
    <>
      <div className="relative">
        <button
          onClick={open}
          className="btn-secondary flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg"
          aria-label="Open command palette"
          title={isMac ? "Search (\u2318K)" : "Search (Ctrl+K)"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <span className="hidden sm:inline text-xs">Search</span>
          <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 ml-1 text-[10px] font-medium text-gray-400 dark:text-gray-500 bg-white/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/10 rounded">
            {isMac ? "\u2318" : "Ctrl"}
            <span>K</span>
          </kbd>
        </button>

        <PaletteTip show={showTip} onDismiss={dismissTip} />
      </div>

      <ThemeToggle />

      <CommandPalette isOpen={isOpen} onClose={close} />
    </>
  );
}
