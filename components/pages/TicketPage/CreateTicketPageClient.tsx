"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { ticketService } from "@/services/ticket-service";
import { TicketPriority } from "@/types/ticket";

interface FormData {
  title: string;
  description: string;
  priority: TicketPriority;
}

interface FormErrors {
  title?: string;
  description?: string;
  priority?: string;
}

export default function CreateTicketPageClient() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    priority: "MEDIUM",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const priorityOptions = [
    { value: "LOW", label: "Low" },
    { value: "MEDIUM", label: "Medium" },
    { value: "HIGH", label: "High" },
  ];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters long";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters long";
    }

    if (!formData.priority) {
      newErrors.priority = "Priority is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value as TicketPriority }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      setSubmitError("");
      setSubmitSuccess(false);

      const ticket = await ticketService.createTicket({
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
      });

      setSubmitSuccess(true);

      setTimeout(() => {
        router.push(`/tickets/${ticket.id}`);
      }, 1500);
    } catch (error: any) {
      console.error("Error creating ticket:", error);
      setSubmitError(
        error?.message || "Failed to create ticket. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-green-800">
            Ticket created successfully!
          </h3>
          <p className="mt-2 text-sm text-green-700">
            Your ticket has been created and you will be redirected to view it
            shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <Link href="/tickets">
          <Button variant="outline">← Back to Tickets</Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-4">
          Create New Ticket
        </h1>
        <p className="text-gray-600">
          Fill in the details below to create a new support ticket.
        </p>
      </div>

      {submitError && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-sm font-medium text-red-800">Error</h3>
          <p className="mt-2 text-sm text-red-700">{submitError}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter a brief title for your ticket"
            error={errors.title}
            helperText="Provide a clear, concise title that describes the issue"
            required
          />

          <Textarea
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Please describe your issue in detail..."
            rows={6}
            error={errors.description}
            helperText="Include as much detail as possible"
            required
          />

          <Select
            label="Priority"
            name="priority"
            value={formData.priority}
            onChange={handleSelectChange}
            options={priorityOptions}
            error={errors.priority}
            helperText="Select the priority level"
            required
          />

          <div className="flex justify-end space-x-4 pt-4">
            <Link href="/tickets">
              <Button variant="outline" type="button" disabled={isSubmitting}>
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating Ticket..." : "Create Ticket"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
