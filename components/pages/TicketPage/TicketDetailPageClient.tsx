"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Loading } from "@/components/ui/Loading";
import { ticketService } from "@/services/ticket-service";
import { Ticket, TicketStatus, TicketPriority } from "@/types/ticket";
import {
  formatDate,
  getPriorityColor,
  getStatusColor,
  getStatusLabel,
} from "@/lib/utils";

interface TicketDetailPageClientProps {
  id: string;
}

export default function TicketDetailPageClient({
  id,
}: TicketDetailPageClientProps) {
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM" as TicketPriority,
  });

  const statusOptions = [
    { value: "OPEN", label: "Open" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "RESOLVED", label: "Resolved" },
  ];

  const priorityOptions = [
    { value: "LOW", label: "Low" },
    { value: "MEDIUM", label: "Medium" },
    { value: "HIGH", label: "High" },
  ];

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setLoading(true);
        const data = await ticketService.getTicketById(Number(id));
        setTicket(data);
        setFormData({
          title: data.title,
          description: data.description,
          priority: data.priority,
        });
        setError("");
      } catch (err: any) {
        setError(
          err?.message ||
            "Failed to load ticket. It may have been deleted or you may not have permission to view it."
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id]);

  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (!ticket) return;
    try {
      setIsSubmitting(true);
      await ticketService.updateTicketStatus(Number(ticket.id), newStatus);
      // 👇 refetch full ticket
      const freshTicket = await ticketService.getTicketById(Number(ticket.id));
      setTicket(freshTicket);
    } catch (err: any) {
      console.error("Failed to update status:", err);
      setError(
        err?.message || "Failed to update ticket status. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value as TicketPriority,
    }));
  };

  const handleSave = async () => {
    if (!ticket) return;
    try {
      setIsSubmitting(true);
      const updatedTicket = await ticketService.updateTicket(
        Number(ticket.id),
        {
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
        }
      );
      setTicket(updatedTicket);
      setIsEditing(false);
    } catch (err: any) {
      console.error("Failed to update ticket:", err);
      setError(err?.message || "Failed to update ticket. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (
      !ticket ||
      !confirm(
        "Are you sure you want to delete this ticket? This action cannot be undone."
      )
    ) {
      return;
    }
    try {
      setIsSubmitting(true);
      await ticketService.deleteTicket(Number(ticket.id));
      router.push("/tickets");
    } catch (err: any) {
      console.error("Failed to delete ticket:", err);
      setError(err?.message || "Failed to delete ticket. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (ticket) {
      setFormData({
        title: ticket.title,
        description: ticket.description,
        priority: ticket.priority,
      });
    }
  };

  // --- UI Rendering (เหมือนเดิมจาก page.tsx เดิม) ---
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center min-h-64">
          <Loading size="lg" text="Loading ticket..." />
        </div>
      </div>
    );
  }

  if (error && !ticket) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-red-800">Error</h3>
          <p className="mt-2 text-sm text-red-700">{error}</p>
          <div className="mt-4">
            <Link href="/tickets">
              <Button variant="outline">Back to Tickets</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h2 className="mt-2 text-xl font-semibold text-gray-900">
          Ticket not found
        </h2>
        <p className="mt-1 text-gray-500">
          The ticket you're looking for doesn't exist or has been deleted.
        </p>
        <div className="mt-6">
          <Link href="/tickets">
            <Button>Back to Tickets</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/tickets">
          <Button variant="outline">← Back to Tickets</Button>
        </Link>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={isSubmitting}
              >
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            {isEditing ? (
              <Input
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
              />
            ) : (
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {ticket.title}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Created {formatDate(ticket.createdAt)}</span>
                  <span>•</span>
                  <span>Last updated {formatDate(ticket.updatedAt)}</span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Description
            </h2>
            {isEditing ? (
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={8}
              />
            ) : (
              <p className="whitespace-pre-line text-gray-700">
                {ticket.description || "No description provided."}
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Details
            </h2>
            <div className="space-y-4">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <Select
                  options={statusOptions}
                  value={ticket.status}
                  onChange={(e) =>
                    handleStatusChange(e.target.value as TicketStatus)
                  }
                  disabled={isSubmitting}
                />
              </div>
              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                {isEditing ? (
                  <Select
                    name="priority"
                    options={priorityOptions}
                    value={formData.priority}
                    onChange={handleSelectChange}
                    disabled={isSubmitting}
                  />
                ) : (
                  <span
                    className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full border ${getPriorityColor(
                      ticket.priority
                    )}`}
                  >
                    {ticket.priority}
                  </span>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Created
                </label>
                <p className="text-sm text-gray-900">
                  {formatDate(ticket.createdAt)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Updated
                </label>
                <p className="text-sm text-gray-900">
                  {formatDate(ticket.updatedAt)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-2">
              {ticket.status !== "OPEN" && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleStatusChange("OPEN")}
                >
                  Reopen Ticket
                </Button>
              )}
              {ticket.status !== "IN_PROGRESS" && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleStatusChange("IN_PROGRESS")}
                >
                  Mark as In Progress
                </Button>
              )}
              {ticket.status !== "RESOLVED" && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleStatusChange("RESOLVED")}
                >
                  Mark as Resolved
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
