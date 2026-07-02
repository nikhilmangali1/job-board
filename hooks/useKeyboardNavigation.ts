"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Options = {
  totalItems: number;
  onSelect: (index: number) => void;
  onEscape: () => void;
  enabled: boolean;
};

export default function useKeyboardNavigation({ totalItems, onSelect, onEscape, enabled }: Options) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => setActiveIndex(-1), 0);
  }, [totalItems]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!enabled) return;

      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          setActiveIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
          break;
        }
        case "Enter": {
          e.preventDefault();
          if (activeIndex >= 0 && activeIndex < totalItems) {
            onSelect(activeIndex);
          }
          break;
        }
        case "Escape": {
          e.preventDefault();
          onEscape();
          break;
        }
      }
    },
    [activeIndex, totalItems, onSelect, onEscape, enabled]
  );

  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const items = listRef.current.querySelectorAll<HTMLElement>("[data-palette-index]");
    const el = items[activeIndex];
    if (el) {
      el.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  return { activeIndex, setActiveIndex, handleKeyDown, listRef };
}
