"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Loading, LoadingSkeleton } from "@/components/ui/Loading";
import { ticketService } from "@/services/ticket-service";
import {
  Ticket,
  TicketStatus,
  TicketPriority,
  TicketFilter,
} from "@/types/ticket";
import {
  formatDate,
  getStatusColor,
  getPriorityColor,
  getStatusLabel,
} from "@/lib/utils";

export default function TicketListPageClient() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TicketFilter>({
    page: 1,
    pageSize: 10,
    sortBy: "createdAt",
    sortOrder: "DESC",
  });
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "OPEN", label: "Open" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "RESOLVED", label: "Resolved" },
  ];

  const priorityOptions = [
    { value: "", label: "All Priorities" },
    { value: "LOW", label: "Low" },
    { value: "MEDIUM", label: "Medium" },
    { value: "HIGH", label: "High" },
  ];

  const sortOptions = [
    { value: "createdAt", label: "Created Date" },
    { value: "updatedAt", label: "Updated Date" },
    { value: "priority", label: "Priority" },
    { value: "status", label: "Status" },
  ];

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const searchFilters = {
        ...filters,
        search: searchTerm || undefined,
      };
      const data = await ticketService.getTickets(searchFilters);

      // PaginatedResponse always has both data and meta properties
      setTickets(data.data);
      setTotal(data.meta.totalItems);

      setError(null);
    } catch (err) {
      setError("Failed to fetch tickets. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (key: keyof TicketFilter, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: 1,
    }));
  };

  const handleSort = (sortBy: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: sortBy as TicketFilter["sortBy"],
      sortOrder:
        prev.sortBy === sortBy && prev.sortOrder === "ASC" ? "DESC" : "ASC",
      page: 1,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const totalPages = Math.ceil(total / (filters.pageSize || 10));

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <Button variant="outline" onClick={fetchTickets}>
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
          <p className="text-gray-600">Manage and track support tickets</p>
        </div>
        <Link href="/tickets/create">
          <Button>Create Ticket</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <form
          onSubmit={handleSearch}
          className="grid grid-cols-1 md:grid-cols-5 gap-4"
        >
          <div className="md:col-span-2">
            <Input
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            options={statusOptions}
            value={filters.status || ""}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            placeholder="Filter by status"
          />
          <Select
            options={priorityOptions}
            value={filters.priority || ""}
            onChange={(e) => handleFilterChange("priority", e.target.value)}
            placeholder="Filter by priority"
          />
          <Button type="submit">Search</Button>
        </form>

        <div className="mt-4 flex items-center justify-between">
          <Select
            options={sortOptions}
            value={filters.sortBy || "createdAt"}
            onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            className="w-48"
          />
          <Button
            variant="outline"
            onClick={() => handleSort(filters.sortBy || "createdAt")}
          >
            {filters.sortOrder === "ASC" ? "↑" : "↓"} Sort{" "}
            {filters.sortOrder === "ASC" ? "Ascending" : "Descending"}
          </Button>
        </div>
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <LoadingSkeleton rows={5} />
        </div>
      ) : tickets.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="mx-auto max-w-md">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No tickets
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new ticket.
            </p>
            <div className="mt-6">
              <Link href="/tickets/create">
                <Button>Create Ticket</Button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {ticket.title}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {ticket.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                          ticket.status
                        )}`}
                      >
                        {getStatusLabel(ticket.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(
                          ticket.priority
                        )}`}
                      >
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(ticket.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(ticket.updatedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link href={`/tickets/${ticket.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button
                variant="outline"
                disabled={(filters.page || 1) === 1}
                onClick={() => handlePageChange((filters.page || 1) - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={(filters.page || 1) >= totalPages}
                onClick={() => handlePageChange((filters.page || 1) + 1)}
              >
                Next
              </Button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {((filters.page || 1) - 1) * (filters.pageSize || 10) + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(
                      (filters.page || 1) * (filters.pageSize || 10),
                      total
                    )}
                  </span>{" "}
                  of <span className="font-medium">{total}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <Button
                    variant="outline"
                    disabled={(filters.page || 1) === 1}
                    onClick={() => handlePageChange((filters.page || 1) - 1)}
                    className="rounded-r-none"
                  >
                    Previous
                  </Button>
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                    Page {filters.page || 1} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={(filters.page || 1) >= totalPages}
                    onClick={() => handlePageChange((filters.page || 1) + 1)}
                    className="rounded-l-none"
                  >
                    Next
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
