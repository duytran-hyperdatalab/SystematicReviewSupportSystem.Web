// Reusable selection state hook for multi-select tables
// Manages a Set of selected IDs with toggle, toggleAll, and clear operations

import { useState, useCallback, useMemo } from "react";

export const useSelection = () => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  /** Toggle a single item */
  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  /** Toggle all items on the current page — if all selected, deselect; otherwise select all */
  const toggleAll = useCallback((ids: string[]) => {
    setSelectedIds((prev) => {
      const allSelected = ids.length > 0 && ids.every((id) => prev.has(id));
      if (allSelected) {
        // Deselect all page items
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      } else {
        // Select all page items
        const next = new Set(prev);
        ids.forEach((id) => next.add(id));
        return next;
      }
    });
  }, []);

  /** Check if a specific ID is selected */
  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds],
  );

  /** Check if all provided IDs are selected (for "select all" checkbox state) */
  const areAllSelected = useCallback(
    (ids: string[]) => ids.length > 0 && ids.every((id) => selectedIds.has(id)),
    [selectedIds],
  );

  /** Check if some (but not all) of the provided IDs are selected (indeterminate state) */
  const areSomeSelected = useCallback(
    (ids: string[]) => {
      const someSelected = ids.some((id) => selectedIds.has(id));
      const allSelected = ids.length > 0 && ids.every((id) => selectedIds.has(id));
      return someSelected && !allSelected;
    },
    [selectedIds],
  );

  /** Clear all selections */
  const clear = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  /** Number of selected items */
  const count = useMemo(() => selectedIds.size, [selectedIds]);

  return {
    selectedIds,
    toggle,
    toggleAll,
    isSelected,
    areAllSelected,
    areSomeSelected,
    clear,
    count,
  };
};
