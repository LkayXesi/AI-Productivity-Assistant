# Space Hub

An AI-powered workplace productivity assistant that helps professionals automate repetitive tasks, improve productivity, and streamline daily work activities.

## Features

- **Smart Email Generator** – Draft professional emails by purpose, audience, and tone.
- **Meeting Notes Summarizer** – Extract key decisions, action items, and deadlines from notes.
- **AI Task Planner** – Build daily and weekly schedules with priority matrices.
- **AI Research Assistant** – Generate executive summaries, insights, and recommendations.
- **AI Chat Assistant** – Multi-turn conversations for any work question.
- **Daily Planner Calendar** – Visual calendar to organize and manage your schedule.

## Tech Stack

- **Frontend:** React 19, Tailwind CSS v4, shadcn/ui
- **Framework:** TanStack Start (full-stack SSR/SSG)
- **Backend:** Lovable Cloud (Supabase) with Row-Level Security
- **AI:** Lovable AI Gateway (Google Gemini)
- **Auth:** Supabase Auth with Google OAuth

## Getting Started

```bash
# Install dependencies
bun install

# Start the development server
bun run dev
```

## Project Structure

```
src/
  components/       # Reusable UI components
  routes/           # TanStack file-based routes
  lib/              # Server functions and utilities
  hooks/            # Custom React hooks
  integrations/     # Supabase and AI gateway clients
```

## License

© 2026 Space Hub. All Rights Reserved.
