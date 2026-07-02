"use client";

import { useEffect, useState } from "react";

type Props = {
  show: boolean;
  onDismiss: () => void;
};

export default function PaletteTip({ show, onDismiss }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!show) { setTimeout(() => setVisible(false), 0); return; }
    const timer = setTimeout(() => setVisible(true), 1000);
    return () => clearTimeout(timer);
  }, [show]);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000);
    return () => clearTimeout(timer);
  }, [visible, onDismiss]);

  if (!visible) return null;

  return (
    <div
      className="absolute top-full right-0 mt-2 z-40 animate-slide-up"
      onClick={() => { setVisible(false); onDismiss(); }}
    >
      <div className="relative bg-blue-600 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
        <div className="absolute -top-1 right-6 w-2 h-2 bg-blue-600 rotate-45" />
        Tip: Press <kbd className="mx-1 px-1 py-0.5 bg-blue-500 rounded text-[10px] font-mono">Ctrl+K</kbd> to search anywhere
        <button
          className="ml-2 text-blue-200 hover:text-white text-[10px]"
          aria-label="Dismiss tip"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
