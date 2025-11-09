# Project Requirements Document (PRD)

## 1. Project Overview

We are building **SA:MP Roleplay Forum**, a full-stack web application where players of a San Andreas Multiplayer (SA:MP) roleplay server can discuss, share guides, report issues, and interact as a community. This forum aims to combine the familiar look and feel of classic bulletin-board systems (like phpBB) with modern UI patterns, seamless user management, and integration points for live game-server data (e.g., player counts, leaderboards).

The core problem this project solves is lowering the barrier for roleplay communities to set up a reliable, secure, and extensible discussion platform that ties directly into their game server. By providing a Docker-ready Next.js starter template—complete with authentication, theming, database schema, and UI components—developers can focus on community features (forums, threads, real-time alerts) rather than boilerplate setup. Success is measured by how quickly a community admin can deploy the forum, onboard users, and extend it with custom game-server integrations.

## 2. In-Scope vs. Out-of-Scope

### In-Scope (Version 1)
- Secure user authentication (sign-up, sign-in, password reset).
- Role-based access control (basic `USER`, `MODERATOR`, `ADMIN`).
- Protected dashboard (`/dashboard`) with separate views for standard users and admins.
- Forum structure:
  - Categories listing page.
  - Thread listing within a category.
  - Thread view with posts and replies.
- Post creation and editing using a Markdown editor.
- Dark/Light theme toggle.
- Backend API routes for core entities (`users`, `categories`, `threads`, `posts`).
- PostgreSQL database schema managed by Drizzle ORM.
- Docker setup for local development and production builds.
- ESLint and TypeScript for code quality and type safety.

### Out-of-Scope (Deferred to Later Phases)
- Real-time features (Socket.IO notifications, live chat).
- Image and avatar uploads (Supabase or Cloudinary integration).
- Full-text search or advanced filtering.
- Automated API documentation (Swagger/OpenAPI).
- Multi-language support.
- Mobile-only native apps (React Native/SwiftUI).

## 3. User Flow

A new visitor lands on the homepage and sees a simple navbar offering **Sign In** and **Sign Up** links along with a list of public forum categories. The user clicks **Sign Up**, fills in their email and password, and confirms via email (if email verification is enabled). Upon successful registration, they are redirected to their personal dashboard. Here they can update their profile, switch themes, or navigate back to the main forum.

From the dashboard or homepage, the user clicks on a category (e.g., "General Discussion"), which brings them to a page listing all active threads within that category. They click **Create New Thread**, give it a title, write their post in the Markdown editor, and submit. The thread view shows the original post along with a reply box at the bottom. Moderators and admins see additional buttons for editing or deleting any post and a link to the Admin Panel for high-level moderation tasks.

## 4. Core Features

- **User Authentication & Management**: Sign up, sign in, password reset flows; cookie-based sessions via `better-auth`; optional email verification.
- **Role-Based Access Control (RBAC)**: `USER`, `MODERATOR`, `ADMIN` roles with middleware guards on API routes and page components.
- **Protected Dashboard**: `/dashboard` area with widgets for recent posts, moderation alerts, and theme toggle.
- **Forum Categories & Threads**: CRUD operations for categories, threads, posts; file-based routing under `/app/forum`.
- **Markdown Editor**: WYSIWYG Markdown support for composing posts; live preview of formatted content.
- **Theming**: Dark/Light mode powered by `next-themes` with CSS variables.
- **Database Layer**: PostgreSQL schema defined in `/db/schema`, managed by Drizzle ORM; migrations script.
- **API Routes**: Next.js API routes under `/app/api/` for authentication and forum endpoints.
- **Docker Support**: `Dockerfile` and `docker-compose.yml` for containerized development and production.
- **Code Quality Tools**: ESLint and TypeScript configurations to enforce consistent style and catch errors.

## 5. Tech Stack & Tools

- **Frontend**:
  - Next.js (App Router) with TypeScript.
  - React + `shadcn/ui` components + Radix UI primitives.
  - Tailwind CSS for utility-first styling.
  - `next-themes` for theme management.
- **Backend**:
  - Next.js API Routes (Node.js).
  - `better-auth` (cookie-based session management) – swappable with NextAuth.js if needed.
  - Drizzle ORM with PostgreSQL.
- **Deployment & Tooling**:
  - Docker & Docker Compose for environment consistency.
  - ESLint (with TypeScript plugin) for linting.
  - Pre-commit hooks (optional) for code formatting.
- **Potential Integrations**:
  - Socket.IO for real-time notifications.
  - Supabase Storage or Cloudinary for file uploads.
  - `next-swagger-doc` for automated API documentation.

## 6. Non-Functional Requirements

- **Performance**: API responses under 200 ms; page load (First Contentful Paint) under 1.5 s on 3G.
- **Scalability**: Design to support up to 10,000 users with horizontal scaling of the Next.js server and PostgreSQL replica read slaves.
- **Security**: HTTP-only cookies for sessions; CSRF protection on forms; input sanitization to prevent XSS; password hashing (bcrypt).
- **Usability**: Mobile-responsive design; accessible color contrast ratios (WCAG AA).
- **Reliability**: Automated database backups; basic error monitoring (e.g., Sentry).

## 7. Constraints & Assumptions

- **Node.js >= 18** and **PostgreSQL >= 13** are available in the deployment environment.
- Drizzle ORM must support our chosen PostgreSQL version and TypeScript configuration.
- `better-auth` package remains maintained; if not, we assume migration to NextAuth.js is feasible.
- The SA:MP game server API (for later real-time data) will be reachable from the same network or via a secure tunnel.
- Docker will be used in production for environment parity.

## 8. Known Issues & Potential Pitfalls

- **API Rate Limits**: External game-server endpoints may throttle requests. Mitigation: implement server-side caching or rate limiter.
- **WebSockets Setup**: Integrating Socket.IO with Next.js App Router requires a custom server or middleware. Mitigation: plan a separate `server.js` entrypoint or use a third-party service like Pusher.
- **Database Migrations**: Drizzle’s migration tooling is less established than Prisma. Mitigation: include a stable migration workflow and version control migration files.
- **Theming Flash**: Users may see a flash of unstyled content before theme loads. Mitigation: add inline script to read theme preference early.
- **Role Escalation Bugs**: Incomplete RBAC checks can allow unauthorized actions. Mitigation: centralize role-checking logic in middleware and write unit tests for every protected route.

---

This PRD sets the foundation for detailed technical documents: Tech Stack Document, Frontend Guidelines, Backend Structure, App Flow, and File Structure. With these requirements in place, an AI or engineering team can move forward without ambiguity.