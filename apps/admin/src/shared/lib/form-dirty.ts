/** Stable JSON snapshot for dirty-checking edit forms. */
export function formSnapshot(value: unknown): string {
  return JSON.stringify(value);
}

export function isFormDirty(
  current: unknown,
  snapshot: string | null | undefined
): boolean {
  if (!snapshot) return false;
  return formSnapshot(current) !== snapshot;
}
