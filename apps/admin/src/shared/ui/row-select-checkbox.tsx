"use client";

type RowSelectCheckboxProps = {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  "aria-label"?: string;
  className?: string;
};

export function RowSelectCheckbox({
  checked,
  indeterminate,
  onChange,
  "aria-label": ariaLabel = "Select row",
  className = "",
}: RowSelectCheckboxProps) {
  return (
    <input
      type="checkbox"
      checked={checked}
      ref={(el) => {
        if (el) el.indeterminate = Boolean(indeterminate);
      }}
      onChange={onChange}
      onClick={(e) => e.stopPropagation()}
      aria-label={ariaLabel}
      className={`border-primary/30 text-primary focus:ring-primary h-4 w-4 shrink-0 rounded border bg-white accent-[var(--color-primary)] focus:ring-1 ${className}`}
    />
  );
}
