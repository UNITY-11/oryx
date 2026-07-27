import { parseOrThrow } from "@/shared/lib/api-helpers";

import type { CompanyDetails, CompanyInput } from "./types";
import type { FieldErrors } from "./validation";

export async function fetchCompany(): Promise<CompanyDetails | null> {
  const res = await fetch("/api/company");
  const data = await parseOrThrow<{ company: CompanyDetails | null }>(
    res,
    "Failed to load company details"
  );
  return data.company;
}

export async function saveCompany(
  input: CompanyInput
): Promise<CompanyDetails> {
  const res = await fetch("/api/company", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const err = new Error(
      body?.error ?? "Failed to save company details"
    ) as Error & {
      fieldErrors?: FieldErrors;
    };
    if (body?.errors) err.fieldErrors = body.errors;
    throw err;
  }

  return res.json();
}
