import { PROMOTIONAL_BANNER_PROJECTION } from "@repo/sanity";

import { PROMOTIONAL_BANNER_DOC_ID } from "./types";

export const PROMOTIONAL_BANNER_QUERY = `*[_type == "promotionalBanner" && _id == "${PROMOTIONAL_BANNER_DOC_ID}"][0] ${PROMOTIONAL_BANNER_PROJECTION}`;
