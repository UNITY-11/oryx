import { useCallback, useEffect, useMemo, useState } from "react";

function setsEqual(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false;
  for (const id of a) {
    if (!b.has(id)) return false;
  }
  return true;
}

export function useBulkSelection(itemIds: string[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const itemIdsKey = itemIds.join("\0");

  const validIdList = useMemo(
    () => (itemIdsKey ? itemIdsKey.split("\0") : []),
    [itemIdsKey]
  );

  const validIds = useMemo(() => new Set(validIdList), [validIdList]);

  useEffect(() => {
    setSelectedIds((prev) => {
      const next = new Set<string>();
      for (const id of prev) {
        if (validIds.has(id)) next.add(id);
      }
      if (setsEqual(prev, next)) return prev;
      return next;
    });
  }, [validIds]);

  const selectedArray = useMemo(
    () => validIdList.filter((id) => selectedIds.has(id)),
    [validIdList, selectedIds]
  );

  const count = selectedArray.length;
  const allSelected = validIdList.length > 0 && count === validIdList.length;
  const isIndeterminate = count > 0 && !allSelected;

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(validIdList));
  }, [validIdList]);

  const clear = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds]
  );

  return {
    selectedIds,
    selectedArray,
    count,
    allSelected,
    isIndeterminate,
    toggle,
    selectAll,
    clear,
    isSelected,
  };
}
