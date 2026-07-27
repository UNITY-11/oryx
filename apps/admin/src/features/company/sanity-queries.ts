import { COMPANY_PROJECTION } from "@repo/sanity";

import { COMPANY_DOC_ID } from "./types";

export const COMPANY_QUERY = `*[_type == "company" && _id == "${COMPANY_DOC_ID}"][0] ${COMPANY_PROJECTION}`;
