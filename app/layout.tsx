import "./globals.css";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ticket System",
  description: "Ticket System Frontend",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  );
}
