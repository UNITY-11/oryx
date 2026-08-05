import { sanityClient } from "@/shared/lib/sanity/client";
import { COMPANY_PROJECTION } from "@repo/sanity";

import type { CompanyDetails } from "./types";

const COMPANY_DOC_ID = "companyDetails";

export const COMPANY_QUERY = `*[_type == "company" && _id == "${COMPANY_DOC_ID}"][0] ${COMPANY_PROJECTION}`;

export async function fetchCompany(): Promise<CompanyDetails | null> {
  return sanityClient.fetch<CompanyDetails | null>(COMPANY_QUERY);
}
