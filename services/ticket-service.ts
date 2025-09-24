import apiClient, { API_BASE_URL } from "@/lib/api-client";
import {
  Ticket,
  TicketCreateInput,
  TicketUpdateInput,
  TicketFilter,
  PaginatedResponse,
  TicketStatus,
} from "@/types/ticket";

class TicketService {
  private basePath = "/tickets";

  // List tickets with filters + pagination
  async getTickets(filters?: TicketFilter): Promise<PaginatedResponse<Ticket>> {
    const url = new URL(this.basePath, API_BASE_URL);

    if (filters) {
      if (filters.status) url.searchParams.set("status", filters.status);
      if (filters.priority) url.searchParams.set("priority", filters.priority);
      if (filters.search) url.searchParams.set("search", filters.search);
      if (filters.page) url.searchParams.set("page", filters.page.toString());
      if (filters.pageSize)
        url.searchParams.set("pageSize", filters.pageSize.toString());
      if (filters.sortBy) url.searchParams.set("sortBy", filters.sortBy);
      if (filters.sortOrder)
        url.searchParams.set("sortOrder", filters.sortOrder);
    }

    const res = await fetch(url, {
      next: { revalidate: 30, tags: ["tickets"] }, // revalidate cache every 30s
    });

    return (await res.json()) as PaginatedResponse<Ticket>;
  }

  // Get by id
  async getTicketById(id: number): Promise<Ticket> {
    return await apiClient.get<Ticket>(`${this.basePath}/${id}`);
  }

  // Create
  async createTicket(data: TicketCreateInput): Promise<Ticket> {
    return await apiClient.post<Ticket>(this.basePath, data);
  }

  // Update
  async updateTicket(id: number, data: TicketUpdateInput): Promise<Ticket> {
    return await apiClient.patch<Ticket>(`${this.basePath}/${id}`, data);
  }

  // Delete
  async deleteTicket(id: number): Promise<{ message: string }> {
    return await apiClient.delete<{ message: string }>(
      `${this.basePath}/${id}`
    );
  }

  // Update status only
  async updateTicketStatus(id: number, status: TicketStatus): Promise<Ticket> {
    return await apiClient.patch<Ticket>(`${this.basePath}/${id}`, { status });
  }
}

export const ticketService = new TicketService();
export default ticketService;
