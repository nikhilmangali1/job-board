"use client";

import { useEffect, useRef } from "react";

type PreviewData = {
  title: string;
  company: string;
  location: string;
  type: string;
  salary_range: string;
  description: string;
  requirements: string;
};

export default function PreviewModal({
  data,
  open,
  onClose,
  onSubmit,
}: {
  data: PreviewData;
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    else if (!open && el.open) el.close();
  }, [open]);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const handler = () => onClose();
    el.addEventListener("close", handler);
    return () => el.removeEventListener("close", handler);
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      className="w-full max-w-2xl rounded-xl shadow-xl border dark:border-gray-700 bg-white dark:bg-gray-800 p-0 backdrop:bg-black/50"
      aria-label="Job preview"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Preview</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Close preview"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 p-5 rounded-xl border dark:border-gray-700">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center text-base font-semibold shrink-0">
              {data.company.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{data.title || "(untitled)"}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{data.company || "(company)"} &middot; {data.location || "(location)"}</p>
            </div>
            {data.type && (
              <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 whitespace-nowrap">{data.type}</span>
            )}
          </div>
          {data.salary_range && <p className="text-green-600 dark:text-green-400 font-semibold mb-3">{data.salary_range}</p>}
          <div className="mb-3">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1">Description</h4>
            <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">{data.description || "(no description)"}</p>
          </div>
          {data.requirements && (
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1">Requirements</h4>
              <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">{data.requirements}</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-medium"
          >
            Edit
          </button>
          <button
            onClick={onSubmit}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-sm font-medium"
          >
            Submit Job
          </button>
        </div>
      </div>
    </dialog>
  );
}
