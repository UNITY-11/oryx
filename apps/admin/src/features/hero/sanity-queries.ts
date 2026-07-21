import { HERO_PROJECTION } from "@repo/sanity";

export const HERO_LIST_QUERY = `*[_type == "hero"] | order(order asc) ${HERO_PROJECTION}`;

export const HERO_BY_ID_QUERY = `*[_type == "hero" && _id == $id][0] ${HERO_PROJECTION}`;
