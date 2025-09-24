"use client";

import { Button, Card, Typography } from "antd";
import Link from "next/link";

const { Title, Paragraph } = Typography;

const LandingPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6 py-12">
      <Card className="max-w-2xl w-full shadow-lg rounded-2xl p-8 text-center">
        <Title level={2} className="mb-4">
          🎫 Ticket System
        </Title>
        <Paragraph className="text-base text-gray-600 mb-8">
          A simple ticketing platform built with <strong>NestJS</strong>,{" "}
          <strong>Next.js</strong>, <strong>BullMQ</strong>, and{" "}
          <strong>Redis</strong>.
          <br />
          Manage tickets and monitor queue jobs easily.
        </Paragraph>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/tickets">
            <Button type="primary" size="large">
              View Tickets
            </Button>
          </Link>
          <Link href="/tickets/create">
            <Button size="large">Create Ticket</Button>
          </Link>
        </div>
      </Card>

      <footer className="mt-8 text-sm text-gray-500">
        © {new Date().getFullYear()} Ticket System
      </footer>
    </div>
  );
};

export default LandingPage;
