export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH";

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  updatedAt: string;
}

export interface TicketCreateInput {
  title: string;
  description: string;
  priority: TicketPriority;
}

export interface TicketUpdateInput {
  title?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
}

export interface TicketFilter {
  status?: TicketStatus;
  priority?: TicketPriority;
  search?: string;
  sortBy?: "createdAt" | "updatedAt" | "priority" | "title";
  sortOrder?: "ASC" | "DESC";
  page?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
    itemsCount: number;
  };
}
