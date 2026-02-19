import type { ServerInventory, ServerDetail } from "./types";

export type ServerListQuery = {
  q?: string;
  location?: string;
  env?: string;
  status?: string;
  power?: string;
  critical?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
};

export type PaginatedResponse<T> = {
  items: T[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};

export type ServerListResponse = PaginatedResponse<ServerInventory>;
export type ServerDetailResponse = ServerDetail;
