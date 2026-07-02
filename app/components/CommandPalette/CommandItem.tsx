"use client";

import { type ReactNode } from "react";

type Props = {
  icon: ReactNode;
  label: string;
  description: string;
  isActive: boolean;
  index: number;
  onSelect: () => void;
};

export default function CommandItem({ icon, label, description, isActive, index, onSelect }: Props) {
  return (
    <button
      data-palette-index={index}
      onClick={onSelect}
      onMouseEnter={(e) => {
        const parent = (e.currentTarget as HTMLElement).closest('[data-palette-list]');
        if (parent) {
          const items = parent.querySelectorAll<HTMLElement>("[data-palette-index]");
          items.forEach((el, i) => {
            el.setAttribute("aria-selected", String(i === index));
          });
        }
      }}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-75 ${
        isActive
          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"
      }`}
      role="option"
      aria-selected={isActive}
    >
      <span className={`shrink-0 ${isActive ? "text-blue-500" : "text-gray-400 dark:text-gray-500"}`}>
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium truncate">{label}</div>
        <div className="text-[11px] text-gray-400 dark:text-gray-500 truncate">{description}</div>
      </div>
    </button>
  );
}
