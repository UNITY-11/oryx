import { PRODUCT_PROJECTION } from "@repo/sanity";

export const PRODUCTS_LIST_QUERY = `*[_type == "product"] | order(name asc) ${PRODUCT_PROJECTION}`;

export const PRODUCT_BY_ID_QUERY = `*[_type == "product" && _id == $id][0] ${PRODUCT_PROJECTION}`;

export type ProductsSortField = "Default" | "StockHigh" | "StockLow";

export type ProductsListQueryInput = {
  q?: string;
  category?: string;
  sort?: ProductsSortField;
  start: number;
  end: number;
};

function buildProductsFilterClause(): string {
  return `_type == "product"
    && ($category == "All" || !defined($category) || $category == "" || category == $category)
    && (
      !defined($q) || $q == "" ||
      name match $pattern ||
      brand match $pattern ||
      category match $pattern
    )`;
}

function buildProductsOrderClause(sort: ProductsSortField): string {
  switch (sort) {
    case "StockHigh":
      return "quantity desc, name asc";
    case "StockLow":
      return "quantity asc, name asc";
    case "Default":
    default:
      return "name asc";
  }
}

export function buildProductsListQueries(input: ProductsListQueryInput) {
  const sort = input.sort ?? "Default";
  const filter = buildProductsFilterClause();
  const orderClause = buildProductsOrderClause(sort);
  const listQuery = `*[${filter}] | order(${orderClause}) [${input.start}...${input.end}] ${PRODUCT_PROJECTION}`;
  const countQuery = `count(*[${filter}])`;
  const activeCountQuery = `count(*[_type == "product" && status == "Active"])`;
  const lowStockCountQuery = `count(*[_type == "product" && quantity > 0 && quantity <= 10])`;
  const outOfStockCountQuery = `count(*[_type == "product" && quantity == 0])`;

  return {
    listQuery,
    countQuery,
    activeCountQuery,
    lowStockCountQuery,
    outOfStockCountQuery,
  };
}
