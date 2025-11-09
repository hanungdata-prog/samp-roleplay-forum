# Tech Stack Document

This document explains the technologies chosen for your SA:MP Roleplay Forum project in simple, everyday language. It covers how each piece fits together, why it was chosen, and what benefits it brings.

## Frontend Technologies

- **Next.js (App Router)**
  - Built on React, it handles both page routing and server-side rendering for fast, SEO-friendly pages.
  - File-based routes (e.g., `app/forum/[categoryId]`) make it easy to see which files map to which URLs.
- **React & TypeScript**
  - React provides the building blocks for interactive interfaces.
  - TypeScript adds type safety, catching errors early and making large codebases easier to maintain.
- **shadcn/ui & Radix UI primitives**
  - Prebuilt, customizable components (cards, tables, buttons) speed up UI development.
  - They give a modern look while letting you recreate the classic forum feel.
- **Tailwind CSS**
  - A utility-first styling framework that lets you design directly in your markup.
  - Speeds up CSS by avoiding long style sheets and ensuring consistent spacing and colors.
- **next-themes**
  - Handles dark/light mode toggling out of the box using CSS variables.
  - Gives users control over their viewing preference with minimal setup.
- **react-markdown**
  - Renders Markdown content (posts, comments) as HTML.
  - Lets users write posts in Markdown and see formatted text instantly.

These choices work together to deliver a fast, responsive, and visually appealing forum interface that’s easy to build on and maintain.

## Backend Technologies

- **Next.js API Routes**
  - Lets you write server-side code alongside your frontend in the same codebase.
  - You can create endpoints like `/api/auth` or `/api/samp/players` without spinning up a separate server.
- **better-auth (cookie-based sessions)**
  - Provides secure sign-up, sign-in, and session handling using HTTP-only cookies.
  - Can be extended later for roles (User, Moderator, Admin), bans, and suspensions.
- **PostgreSQL**
  - A reliable, open-source relational database for storing users, categories, threads, posts, roles, and more.
- **Drizzle ORM**
  - A type-safe query builder that integrates seamlessly with TypeScript.
  - Catches mistakes at compile time, making data management less error-prone.
- **Socket.IO**
  - Adds real-time capabilities (e.g., notifications, live chat) via WebSockets.
  - Keeps users engaged by delivering updates instantly.
- **next-swagger-doc** (optional)
  - Automatically generates OpenAPI (Swagger) documentation for your API routes.
  - Makes it easier for developers to understand and test your endpoints.

Together, these technologies handle user data, authentication, and real-time features in a secure, organized way.

## Infrastructure and Deployment

- **Docker**
  - Containers ensure your development environment matches production exactly.
  - Simplifies onboarding: just `docker-compose up` to get everything running.
- **Version Control: Git & GitHub**
  - Tracks changes, enables collaboration, and stores your code safely in repositories.
- **CI/CD with GitHub Actions**
  - Automatically runs linting (ESLint) and tests on every push or pull request.
  - Deploys to your hosting platform when checks pass, reducing manual steps.
- **Hosting Platforms: Vercel or Render**
  - Offer seamless integration with Next.js for zero-configuration deployments.
  - Provide global CDN, HTTPS, and automatic scaling.

These choices make your app reliable, easy to update, and ready to scale as your community grows.

## Third-Party Integrations

- **Cloudinary or Supabase Storage**
  - Handles image and avatar uploads via simple API calls.
  - Offloads media storage and optimization so your server stays lean.
- **Socket.IO**
  - Provides live features, such as real-time notifications for mentions and new replies.
- **SA:MP Game Server API**
  - Custom Next.js API routes can fetch live player counts, leaderboards, and faction lists.
  - Keeps your forum in sync with in-game events.
- **next-swagger-doc**
  - Adds self-documenting API pages under `/api/docs`, improving transparency for future developers.

These services enhance your forum’s functionality by adding media handling, live updates, and clear API documentation.

## Security and Performance Considerations

Security Measures:
- HTTP-only, secure cookies prevent JavaScript access and cross-site scripting attacks.
- Role-based access control (RBAC) with user, moderator, and admin levels ensures only authorized actions.
- Type-safe queries (Drizzle ORM) reduce the risk of SQL injection.
- HTTPS enforced by hosting platforms protects data in transit.

Performance Optimizations:
- Server-side rendering (SSR) and static generation (SSG) in Next.js deliver fast page loads.
- Code splitting and lazy loading keep bundle sizes small.
- Database indexing and query optimization in PostgreSQL minimize response times.
- Docker production builds strip out dev dependencies for a lean runtime.

These practices keep your forum both secure and snappy for end users.

## Conclusion and Overall Tech Stack Summary

We’ve chosen a modern, well-integrated stack that aligns with your goals of building a classic-feeling yet modern SA:MP Roleplay Forum. Key highlights:

- **Next.js + React + TypeScript:** A unified codebase for frontend and backend with strong type safety.
- **shadcn/ui + Tailwind + next-themes:** Rapid, consistent styling and theming for a polished user interface.
- **PostgreSQL + Drizzle ORM:** A reliable, type-safe data layer ready to handle complex forum relationships.
- **Docker + GitHub Actions + Vercel/Render:** A rock-solid pipeline from code to deployment, ensuring reliability and scalability.
- **Socket.IO + Cloudinary/Supabase:** Real-time features and media handling that enhance user engagement.

This combination gives you everything you need to focus on building the unique community and game integration features that will set your forum apart. Feel confident that each technology was chosen to support stability, security, and a smooth user experience.