import { Pagination } from "../core/pagination";

export interface FilterData {
  filter?: any,
  pagination?: Pagination | null,
  select?: any;
  sort?: any;
}
