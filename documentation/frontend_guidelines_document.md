# Frontend Guideline Document for samp-roleplay-forum

This document outlines the frontend architecture, design principles, and technologies used in the samp-roleplay-forum project. It is written in everyday language to help any team member understand the frontend setup.

## 1. Frontend Architecture

**Framework and Libraries**
- **Next.js (App Router)**: Provides file-based routing, server components, and API routes in one framework. It handles both server-side rendering (SSR) and static site generation (SSG).
- **React**: Builds interactive UI components.
- **TypeScript**: Adds type safety across the codebase, reducing runtime errors.
- **shadcn/ui + Radix UI Primitives**: Pre-built, customizable UI components (cards, buttons, tables, avatars) that speed up development and ensure consistency.
- **Tailwind CSS**: A utility-first CSS framework for rapid and consistent styling.
- **next-themes**: Manages dark/light mode toggle using CSS variables.

**Scalability, Maintainability, Performance**
- **File-based Routing**: Next.js maps folders under `/app` to URLs, making it easy to add new pages following the forum structure (e.g., `/app/forum/[categoryId]`).
- **Component-First Structure**: Reusable components in `/components` and UI primitives under `components/ui` keep code DRY (Don’t Repeat Yourself).
- **Server Components**: Reduce client bundle size by rendering parts of pages on the server.
- **API Routes**: Built-in under `/app/api`, they enable a single codebase for frontend and backend calls.
- **Docker**: Ensures identical environments across development and production, minimizing “it works on my machine” issues.

## 2. Design Principles

**Usability**
- Clear navigation with a sidebar listing categories and links to profiles.
- Familiar forum layout: categories, threads, and posts in a straightforward hierarchy.

**Accessibility**
- Semantic HTML elements (e.g., `<header>`, `<nav>`, `<main>`, `<button>`) to support screen readers.
- Focus states on interactive elements for keyboard navigation.
- ARIA attributes as needed (e.g., `aria-label` on toggles).

**Responsiveness**
- Mobile-first design with Tailwind’s responsive utilities.
- Breakpoints ensure the sidebar becomes a hamburger menu on small screens.

## 3. Styling and Theming

**Styling Approach**
- **Tailwind CSS**: Utility classes handle margins, padding, typography, colors, and layout.
- No separate CSS files—styles live alongside markup in JSX for quick feedback.

**Theming**
- **CSS Variables**: Define colors and typography in `:root` for light and dark themes.
- **next-themes**: Wraps the app in a ThemeProvider, allowing users to toggle modes.

**Visual Style**
- Overall vibe: **Flat, modern design** with subtle shadows and clean edges.
- Components use a hint of glassmorphism (semi-transparent cards) to add depth without complexity.

**Color Palette**
- Primary: #1D4ED8 (blue-700)
- Secondary: #F59E0B (amber-500)
- Background Light: #FFFFFF (gray-50)
- Background Dark: #1F2937 (gray-800)
- Text Light: #111827 (gray-900)
- Text Dark: #F3F4F6 (gray-100)
- Accent: #3B82F6 (blue-500)
- Borders & Dividers: #E5E7EB (gray-200) / #374151 (gray-700)

**Fonts**
- **Primary Font**: Inter, a modern sans-serif with good readability.
- Fallbacks: system-ui, -apple-system, BlinkMacSystemFont, sans-serif.

## 4. Component Structure

**Organization**
- `/components/ui`: Shared UI primitives from shadcn/ui and Radix.
- `/components`: App-specific components (Sidebar, ThreadList, PostCard, MarkdownEditor).
- `/app`: Page folders for routing, each can have its own `page.tsx`, `layout.tsx`, and `loading.tsx`.

**Reuse and Composition**
- Small, focused components that accept props and slots (children).
- Example: a `<PostCard>` can render a post’s content and embed buttons or footers via children.

**Benefits of Component Architecture**
- Easier to test individual pieces.
- Faster UI updates—change in one component reflects everywhere it’s used.
- Clear ownership—each component has a single responsibility.

## 5. State Management

**Local State & Server Data**
- **React State & Hooks**: For simple UI interactions (modals, form inputs).
- **Server Components**: Fetch data on the server using Next.js’s `fetch` in server components to reduce client work.

**Global State**
- **Context API**: Manages theme selection and authentication status.
- **Data Fetching & Caching**: Recommended use of libraries like SWR or React Query for client-side caching, mutation, and revalidation of API data.

## 6. Routing and Navigation

**Routing**
- **File-based** under `/app`: Each folder corresponds to a URL segment.
- Dynamic routes: `[categoryId]`, `[threadId]`, `[...all]` in API routes.

**Protected Routes**
- Middleware or higher-order components check authentication and roles before rendering dashboard or admin pages.
- Example: `app/(auth)/dashboard` only shows for logged-in users.

**Navigation**
- **Sidebar Component**: Lists links to categories, user profile, settings.
- **Breadcrumbs**: Show user’s location in the forum hierarchy.
- **Theme Toggle**: Button in header to switch dark/light modes.

## 7. Performance Optimization

**Code Splitting & Lazy Loading**
- Next.js automatically splits code per page.
- Use dynamic imports for heavy components (e.g., Markdown editor).

**Asset Optimization**
- `next/image` for responsive, optimized images.
- Purge unused CSS with Tailwind’s built-in tree shaking.

**Caching & Prefetching**
- Link prefetching with `<Link>` in Next.js.
- HTTP caching headers on API responses.

**Server Components**
- Offload rendering of data-heavy parts to the server, reducing client JS shipped.

## 8. Testing and Quality Assurance

**Unit Tests**
- **Jest + React Testing Library**: Test components, hooks, and utility functions.
- Focus on critical logic like role checks, form validation, and rendering of key UI components.

**Integration Tests**
- Combine components with mocked API calls using **MSW (Mock Service Worker)**.
- Test flows: login, viewing threads, creating posts.

**End-to-End Tests**
- **Cypress** or **Playwright**: Validate full user journeys in a real browser.
- Key scenarios: sign-up/sign-in, thread creation, admin panel access.

**Linting & Formatting**
- **ESLint** with TypeScript rules for code consistency.
- **Prettier** for automatic code formatting.

## 9. Conclusion and Overall Frontend Summary

This guideline captures the key aspects of the samp-roleplay-forum frontend: a scalable Next.js architecture, clear design principles focused on usability and accessibility, and a modern flat design with light/dark theming. The component-based structure, combined with Tailwind CSS and shadcn/ui, ensures rapid development and consistent UI. State is managed locally with React hooks and globally with Context and data-fetching libraries. File-based routing streamlines navigation, while performance optimizations and a solid testing strategy guarantee a smooth experience for users and maintainers alike. By following these guidelines, the team can build a maintainable, high-performance SA:MP roleplay forum that delights both community members and administrators.