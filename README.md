# Ticket System Frontend (Next.js + TypeScript + Tailwind + Ant Design)

Frontend for the Ticket System, built with Next.js App Router.
Supports ticket management, client-side validation, and integration with the backend API.

## Features

- Ticket CRUD UI (list, detail, create, delete, update)
- Client-side validation + error/success states
- Loading skeletons, empty states, error boundaries
- Quick actions (change status, priority)
- Reusable UI components (Button, Input, Select, Textarea, Loading)
- API service layer (`ticket-service.ts`)

## Tech Stack

- **Framework**: Next.js (App Router, TypeScript)
- **UI**: Tailwind CSS + Ant Design
- **State**: React Hooks
- **API**: REST (calls NestJS backend)

## Getting Started

### 1. Environment Variables (`.env`)

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

_(Point this to your backend NestJS API)_

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

Frontend will be running at:

👉 [http://localhost:3000](http://localhost:3000) (or whichever port you configure)

### 4. Project Structure

```
app/                  # Next.js App Router pages
  (app)/tickets/      # Ticket routes (list, create, detail)
components/           # UI + page components
  ui/                 # Reusable UI (Button, Input, Select, etc.)
  pages/              # Page-level components
services/             # API service layer (fetch tickets, CRUD)
types/                # Shared TypeScript types
lib/                  # Utilities (formatDate, helpers)
public/               # Static assets
```

## Development Notes

- Uses `LoadingSkeleton` for SSR hydration safety.
- Client-side validation is handled inside forms (title, description, priority).
- Success/error states are displayed inline with proper UI feedback.
