// Keyboard navigation hook for the Deduplication tab
// Supports: ↑↓ pair navigation, 1/2 resolve shortcuts, N next unresolved

import { useEffect, useCallback } from "react";
import type { DuplicatePair, DuplicateResolution } from "../../../../types/deduplication";

interface UseDeduplicationKeyboardOptions {
  /** All pairs currently visible in the queue (post-filter) */
  visiblePairs: DuplicatePair[];
  /** Currently selected pair */
  selectedPair: DuplicatePair | null;
  /** Callback to select a pair */
  onSelectPair: (pair: DuplicatePair) => void;
  /** Callback to resolve with a decision */
  onResolve: (decision: DuplicateResolution) => void;
  /** Whether keyboard shortcuts are enabled (disabled when modals/inputs are focused) */
  enabled: boolean;
}

/**
 * Provides keyboard shortcuts for deduplication workflow:
 * - Arrow Up/Down: navigate through pairs queue
 * - 1: Keep Both (not duplicates)
 * - 2: Cancel(confirm as duplicate, remove)
 * - N: Jump to next unresolved pair
 */
export function useDeduplicationKeyboard({
  visiblePairs,
  selectedPair,
  onSelectPair,
  onResolve,
  enabled,
}: UseDeduplicationKeyboardOptions): void {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't intercept when user is typing in an input/textarea/select
      const target = event.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      if (tagName === "input" || tagName === "textarea" || tagName === "select") return;
      if (target.isContentEditable) return;

      const currentIndex = selectedPair
        ? visiblePairs.findIndex((p) => p.id === selectedPair.id)
        : -1;

      switch (event.key) {
        case "ArrowUp": {
          event.preventDefault();
          if (visiblePairs.length === 0) return;
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : 0;
          onSelectPair(visiblePairs[prevIndex]);
          break;
        }

        case "ArrowDown": {
          event.preventDefault();
          if (visiblePairs.length === 0) return;
          const nextIndex =
            currentIndex < visiblePairs.length - 1 ? currentIndex + 1 : visiblePairs.length - 1;
          onSelectPair(visiblePairs[nextIndex]);
          break;
        }

        case "1": {
          if (!selectedPair || selectedPair.status === "resolved") return;
          event.preventDefault();
          onResolve("keep-both");
          break;
        }

        case "2": {
          if (!selectedPair || selectedPair.status === "resolved") return;
          event.preventDefault();
          onResolve("cancel");
          break;
        }

        case "n":
        case "N": {
          event.preventDefault();
          // Jump to next unresolved pair after current
          const startSearch = currentIndex >= 0 ? currentIndex + 1 : 0;
          for (let i = 0; i < visiblePairs.length; i++) {
            const idx = (startSearch + i) % visiblePairs.length;
            if (visiblePairs[idx].status === "pending") {
              onSelectPair(visiblePairs[idx]);
              break;
            }
          }
          break;
        }
      }
    },
    [enabled, visiblePairs, selectedPair, onSelectPair, onResolve],
  );

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, handleKeyDown]);
}
