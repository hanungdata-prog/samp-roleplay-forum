# Backend Structure Document

This document outlines the backend architecture, hosting solutions, and infrastructure components for the SA:MP Roleplay Forum. It uses clear, everyday language and covers everything you need to understand how the backend is built, from the database layer to security and monitoring.

## 1. Backend Architecture

**Overall Design**
- We use Next.js API Routes to handle all backend logic within the same project that powers the frontend. This means one unified codebase for UI and server code.
- The project follows a modular, file-based routing pattern. Folder structure directly maps to URL paths, making the code easy to navigate.
- We implement the **Model–View–Controller (MVC)** principles informally:  
  • Models are your Drizzle ORM definitions and database schema.  
  • Controllers are the API route handlers under `app/api/`.  
  • Views are the React components in the `app/` directory.

**Scalability, Maintainability, Performance**
- **Scalability:** By containerizing the app with Docker, we can spin up multiple instances behind a load balancer. Adding new API routes or database tables is straightforward due to the file-based approach and Drizzle’s type-safe schema.
- **Maintainability:** Using TypeScript everywhere (Next.js, Drizzle, API handlers) ensures type safety across the board, catching many errors at compile time. Components and API logic are organized in clear folders.
- **Performance:** Next.js supports server-side rendering (SSR) and static generation where needed. Drizzle ORM generates efficient SQL queries. We’ll layer in caching for hot data and use a CDN for static assets.

## 2. Database Management

**Database Technology**
- Database type: Relational (SQL)
- Database system: PostgreSQL
- ORM: Drizzle ORM (type-safe, lightweight alternative to Prisma)

**Data Structure & Access**
- Data is organized into tables representing users, sessions, categories, threads, posts, roles, and other forum entities.
- Drizzle ORM definitions live in `db/schema/*`. These files define tables and relationships in code.
- Database connections and pools are managed in `db/index.ts`. This ensures efficient reuse of connections.
- Standard practices:  
  • Migrations: Use `drizzle-kit` to generate and apply schema changes.  
  • Connection pooling: Leverage PostgreSQL’s native pooling.  
  • Backups: Schedule automated daily backups of the database to cloud storage.

## 3. Database Schema

**Human-Readable Overview**
- Users: stores login credentials, profile info, role, and status (active, banned).  
- Sessions: tracks user sessions via secure cookies.  
- Categories: organizes forum into sections (General, Support, etc.).  
- Threads: each discussion topic belongs to a category and has an author and timestamps.  
- Posts: replies within a thread, linked to users and threads.  
- Roles: defines possible roles (User, Moderator, Admin).  
- Reports: tracks user-generated reports on posts or threads.

**SQL Schema (PostgreSQL)**
```sql
-- Users
CREATE TABLE users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email          TEXT UNIQUE NOT NULL,
  password_hash  TEXT NOT NULL,
  display_name   TEXT NOT NULL,
  role           TEXT NOT NULL CHECK (role IN ('USER','MODERATOR','ADMIN')),
  status         TEXT NOT NULL CHECK (status IN ('ACTIVE','BANNED')),
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Sessions
CREATE TABLE sessions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES users(id) ON DELETE CASCADE,
  session_token  TEXT UNIQUE NOT NULL,
  expires_at     TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Categories
CREATE TABLE categories (
  id             SERIAL PRIMARY KEY,
  name           TEXT UNIQUE NOT NULL,
  description    TEXT,
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Threads
CREATE TABLE threads (
  id             SERIAL PRIMARY KEY,
  category_id    INT REFERENCES categories(id) ON DELETE SET NULL,
  author_id      UUID REFERENCES users(id),
  title          TEXT NOT NULL,
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Posts
CREATE TABLE posts (
  id             SERIAL PRIMARY KEY,
  thread_id      INT REFERENCES threads(id) ON DELETE CASCADE,
  author_id      UUID REFERENCES users(id),
  content        TEXT NOT NULL,
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Roles (enum table optional)
CREATE TABLE roles (
  name           TEXT PRIMARY KEY
);

-- Reports
CREATE TABLE reports (
  id             SERIAL PRIMARY KEY,
  reporter_id    UUID REFERENCES users(id),
  target_post    INT REFERENCES posts(id),
  reason         TEXT,
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```  

## 4. API Design and Endpoints

**Design Approach**
- We follow a **RESTful** style with clear resource-based endpoints.
- API routes are file-based under `app/api/`, e.g., `app/api/auth/`, `app/api/forum/`, `app/api/samp/`.
- Responses use standard HTTP status codes and JSON payloads.

**Key Endpoints**
- **Authentication**  
  • POST `/api/auth/signup` – create a new user.  
  • POST `/api/auth/login` – authenticate and set session cookie.  
  • POST `/api/auth/logout` – destroy session.
- **User Management**  
  • GET `/api/users/me` – fetch current user profile.  
  • PATCH `/api/users/me` – update profile or password.
- **Forum**  
  • GET `/api/forum/categories` – list categories.  
  • GET `/api/forum/categories/:id/threads` – list threads in a category.  
  • POST `/api/forum/threads` – create a new thread.  
  • GET `/api/forum/threads/:id/posts` – list posts in a thread.  
  • POST `/api/forum/posts` – add a reply.
- **Admin/Moderator**  
  • DELETE `/api/forum/posts/:id` – remove a post (role guard).  
  • PATCH `/api/users/:id/status` – ban or unban a user.
- **SA:MP Integration**  
  • GET `/api/samp/players` – fetch in-game player list.  
  • GET `/api/samp/factions` – fetch faction data.  
  • GET `/api/samp/leaderboard` – fetch in-game leaderboard.

## 5. Hosting Solutions

**Cloud Provider**
- Primary: Render or Vercel for web hosting.  
- Database hosting: Managed PostgreSQL (e.g., AWS RDS, Heroku Postgres, or Render DB).

**Benefits**
- **Reliability:** Managed services offer automatic failover and backups.  
- **Scalability:** Vertical and horizontal scaling through service dashboards.  
- **Cost-effectiveness:** Pay-as-you-go pricing with free tiers for small projects.

## 6. Infrastructure Components

**Load Balancer**
- Provided by hosting platform (Vercel, Render) to distribute traffic across instances.

**Caching**
- In-memory cache: Redis for session data or hot query results.  
- Static assets: Served via CDN (Vercel’s built-in CDN or Cloudflare) for fast global delivery.

**CDN**
- Distributes CSS, JS, images, and other static files to edge locations worldwide.

**Worker / Queue (Future)**
- A simple job queue (e.g., Bull or RabbitMQ) for processing tasks like email notifications, image resizing, or report moderation.

**Real-time Component**
- Socket.IO server can be integrated via a custom Next.js server (if real-time chat or notifications are added).

## 7. Security Measures

**Authentication & Authorization**
- Cookie-based sessions: HTTP-only, Secure, SameSite attributes.  
- Role-based access control (RBAC): Middleware checks user role (`USER`, `MODERATOR`, `ADMIN`) before sensitive endpoints.

**Data Encryption**
- TLS/SSL enforced for all requests.  
- Passwords hashed with bcrypt or Argon2.

**Input Validation & Sanitization**
- Use `zod` or similar schema validators in API handlers to prevent malformed data.

**Rate Limiting & Abuse Protection**
- Rate-limit key endpoints (login, signup, report) with a tool like `express-rate-limit` or platform built-ins.

**Compliance**
- Prepare for GDPR by providing endpoints to delete user data and cookie consent banners if needed.

## 8. Monitoring and Maintenance

**Monitoring Tools**
- Application performance: Sentry or LogRocket for error tracking and performance metrics.  
- Logs: Centralized logging via a service like Logflare or Datadog.  
- Uptime: UptimeRobot or Pingdom to alert on downtime.

**Maintenance Strategies**
- Automated tests: Unit tests for critical logic (auth, permissions) and integration tests for key API flows.  
- CI/CD pipeline: GitHub Actions or Render’s built-in deploy pipeline to run tests and deploy on merge.  
- Dependency management: Regularly run `npm audit` and update vulnerable packages.

## 9. Conclusion and Overall Backend Summary

The backend for the SA:MP Roleplay Forum is built on a modern, unified Next.js stack that combines server routes and frontend pages in one codebase. PostgreSQL with Drizzle ORM ensures data integrity and type safety. Hosting on Vercel or Render brings reliability, scalability, and global performance. Critical infrastructure like load balancing, CDN, and Redis caching improve the user experience. Robust security practices—from cookie-based sessions to RBAC and input validation—safeguard user data. Monitoring, logging, and CI/CD pipelines ensure the backend remains healthy, secure, and easy to maintain. Together, these components provide a solid foundation for a fast, secure, and feature-rich community forum that can grow as your user base and feature set expand.