"use client";

import { type ReactNode } from "react";

type Props = {
  label: string;
  children: ReactNode;
};

export default function CommandGroup({ label, children }: Props) {
  return (
    <div role="group" aria-label={label}>
      <div className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
        {label}
      </div>
      {children}
    </div>
  );
}
