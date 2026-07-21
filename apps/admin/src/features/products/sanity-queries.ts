import { PRODUCT_PROJECTION } from "@repo/sanity";

export const PRODUCTS_LIST_QUERY = `*[_type == "product"] | order(name asc) ${PRODUCT_PROJECTION}`;

export const PRODUCT_BY_ID_QUERY = `*[_type == "product" && _id == $id][0] ${PRODUCT_PROJECTION}`;
