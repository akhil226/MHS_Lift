export interface Pagination {
  page: number;
  totalCount: number;
  step?: number;
  size?: number;
}
export interface PagionationOffset {
  limitList: number;
  offsetList: number;
}
export const DEFAULT_ROWS_PER_PAGE = 25;
