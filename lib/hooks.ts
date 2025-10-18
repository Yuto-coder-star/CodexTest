"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type CommandPaletteController = {
  open: () => void;
  close: () => void;
  toggle: () => void;
  isOpen: boolean;
};

export function useCommandPalette(): CommandPaletteController {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((value) => !value), []);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const isMeta = event.metaKey || event.ctrlKey;
      if (isMeta && event.key.toLowerCase() === "k") {
        event.preventDefault();
        open();
      }
      if (event.key === "Escape") {
        close();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [close, open]);

  return useMemo(() => ({ open, close, toggle, isOpen }), [close, isOpen, open, toggle]);
}
