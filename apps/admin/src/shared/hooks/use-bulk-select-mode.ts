"use client";

import { useState } from "react";
import type { useBulkSelection } from "@/shared/hooks/use-bulk-selection";

type BulkSelection = ReturnType<typeof useBulkSelection>;

export function useBulkSelectMode(selection: BulkSelection) {
  const [selectMode, setSelectMode] = useState(false);
  const showCheckboxes = selectMode || selection.count > 0;

  const exit = () => {
    selection.clear();
    setSelectMode(false);
  };

  const toggleSelect = () => {
    if (selectMode) {
      exit();
    } else {
      setSelectMode(true);
    }
  };

  const selectAll = () => {
    setSelectMode(true);
    selection.selectAll();
  };

  return {
    selectMode,
    showCheckboxes,
    toggleSelect,
    selectAll,
    exit,
  };
}
