"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/app/ThemeProvider";
import { getCachedJobs } from "@/lib/jobsCache";
import { getFilteredCommands, type CommandContext } from "@/lib/commandRegistry";
import { tokenMatch } from "@/lib/fuzzySearch";
import { loadRecent, addRecent, type RecentItem } from "@/lib/recentStorage";
import { loadResume } from "@/lib/resumeParser";
import useKeyboardNavigation from "@/hooks/useKeyboardNavigation";
import SearchInput from "./SearchInput";
import CommandGroup from "./CommandGroup";
import CommandItem from "./CommandItem";
import JobResult from "./JobResult";
import RecentGroup from "./RecentGroup";

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

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CommandPalette({ isOpen, onClose }: Props) {
  const router = useRouter();
  const { theme, toggle: toggleTheme } = useTheme();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [jobs, setJobs] = useState<CachedJob[]>([]);
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [resumeSkills, setResumeSkills] = useState<string[]>([]);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const recent = loadRecent();
    const { skills } = loadResume();
    setTimeout(() => {
      setQuery("");
      setDebouncedQuery("");
      setRecentItems(recent);
      setResumeSkills(skills);
    }, 0);
    getCachedJobs().then(setJobs);
  }, [isOpen]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 100);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (overlayRef.current && e.target === overlayRef.current) {
        onClose();
      }
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  const cmdCtx: CommandContext = useMemo(
    () => ({
      router,
      theme,
      toggleTheme,
      close: onClose,
      addRecent: (item) => {
        const newItem: RecentItem = { ...item, timestamp: Date.now() } as RecentItem;
        setRecentItems((prev) => {
          const updated = addRecent(prev, newItem);
          return updated;
        });
      },
    }),
    [router, theme, toggleTheme, onClose]
  );

  const filteredCommands = useMemo(
    () => getFilteredCommands(debouncedQuery, theme),
    [debouncedQuery, theme]
  );

  const filteredJobs = useMemo(() => {
    if (!debouncedQuery) return [];
    return jobs.filter((job) => {
      if (tokenMatch(debouncedQuery, job.title)) return true;
      if (tokenMatch(debouncedQuery, job.company)) return true;
      if (tokenMatch(debouncedQuery, job.location)) return true;
      if (tokenMatch(debouncedQuery, job.description)) return true;
      if (job.requirements && tokenMatch(debouncedQuery, job.requirements)) return true;
      return false;
    }).slice(0, 8);
  }, [debouncedQuery, jobs]);

  const showRecent = !debouncedQuery && recentItems.length > 0;

  const totalItems = (showRecent ? recentItems.length : 0) + filteredCommands.length + filteredJobs.length;

  const handleSelect = (index: number) => {
    let offset = 0;

    if (showRecent) {
      if (index < recentItems.length) {
        const item = recentItems[index];
        handleRecentSelect(item);
        return;
      }
      offset = recentItems.length;
    }

    if (index - offset < filteredCommands.length) {
      const cmd = filteredCommands[index - offset];
      cmd.execute(cmdCtx);
      return;
    }
    offset += filteredCommands.length;

    if (index - offset < filteredJobs.length) {
      const job = filteredJobs[index - offset];
      openJob(job);
    }
  };

  const handleRecentSelect = (item: RecentItem) => {
    if (item.type === "command") {
      const cmd = getFilteredCommands("", theme).find((c) => c.id === item.id);
      if (cmd) {
        cmd.execute(cmdCtx);
        return;
      }
    }
    if (item.type === "job") {
      router.push(`/jobs/${item.id}`);
      onClose();
      return;
    }
    if (item.type === "search") {
      router.push(`/?search=${encodeURIComponent(item.label)}`);
      onClose();
      return;
    }
  };

  const openJob = (job: CachedJob) => {
    const newItem: RecentItem = { type: "job", id: String(job.id), label: job.title, timestamp: Date.now() };
    setRecentItems((prev) => addRecent(prev, newItem));
    cmdCtx.addRecent({ type: "job", id: String(job.id), label: job.title });
    router.push(`/jobs/${job.id}`);
    onClose();
  };

  const { activeIndex, handleKeyDown, listRef } = useKeyboardNavigation({
    totalItems,
    onSelect: handleSelect,
    onEscape: onClose,
    enabled: isOpen,
  });

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] bg-black/40 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div className="w-full max-w-xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl border dark:border-gray-700 overflow-hidden animate-scale-in origin-top">
        <SearchInput value={query} onChange={setQuery} onKeyDown={handleKeyDown} />

        <div
          ref={listRef}
          data-palette-list
          className="max-h-[420px] overflow-y-auto overscroll-contain py-2"
          id="palette-listbox"
          role="listbox"
          aria-label="Results"
        >
          {showRecent && (
            <RecentGroup
              items={recentItems}
              onSelect={(item) => {
                const idx = recentItems.indexOf(item);
                handleSelect(idx);
              }}
            />
          )}

          {filteredCommands.length > 0 && (
            <CommandGroup label="Commands">
              {filteredCommands.map((cmd, i) => {
                const offset = showRecent ? recentItems.length : 0;
                return (
                  <CommandItem
                    key={cmd.id}
                    icon={cmd.icon}
                    label={cmd.label}
                    description={cmd.description}
                    isActive={activeIndex === offset + i}
                    index={offset + i}
                    onSelect={() => handleSelect(offset + i)}
                  />
                );
              })}
            </CommandGroup>
          )}

          {filteredJobs.length > 0 && (
            <CommandGroup label="Jobs">
              {filteredJobs.map((job, i) => {
                const offset = (showRecent ? recentItems.length : 0) + filteredCommands.length;
                return (
                  <JobResult
                    key={`job-${job.id}`}
                    job={job}
                    query={debouncedQuery}
                    isActive={activeIndex === offset + i}
                    index={offset + i}
                    resumeSkills={resumeSkills}
                    onOpen={() => openJob(job)}
                    onCopyLink={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/jobs/${job.id}`);
                    }}
                    onSave={() => {
                      try {
                        const saved = JSON.parse(localStorage.getItem("techjobs_saved") || "[]");
                        if (!saved.includes(job.id)) {
                          saved.push(job.id);
                          localStorage.setItem("techjobs_saved", JSON.stringify(saved));
                        }
                      } catch { /* ignore */ }
                    }}
                  />
                );
              })}
            </CommandGroup>
          )}

          {debouncedQuery && filteredCommands.length === 0 && filteredJobs.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-gray-400 dark:text-gray-500">
              No matching jobs or commands.
            </div>
          )}

          {!debouncedQuery && !showRecent && filteredCommands.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-gray-400 dark:text-gray-500">
              Type to search jobs or run a command.
            </div>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-4 px-4 py-2 border-t dark:border-gray-700 text-[10px] text-gray-400 dark:text-gray-500">
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 border dark:border-gray-700 rounded text-[9px] font-medium">↑↓</kbd>
            <span>Navigate</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 border dark:border-gray-700 rounded text-[9px] font-medium">↵</kbd>
            <span>Select</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 border dark:border-gray-700 rounded text-[9px] font-medium">Esc</kbd>
            <span>Close</span>
          </span>
        </div>
      </div>
    </div>
  );
}
