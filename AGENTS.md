# figma-make-app

React + Vite + Tailwind CSS project running inside Figma Make, with a Hono API server backend.

## Development Server

A Vite development server is **already running** on `$PORT` (default 8443). You don't need to start it manually.

- Preview URL: The user can access the running app through the preview panel
- Hot reload: Changes to source files are reflected immediately

## Running the Backend Server

The API server runs on port 3001 by default. Start it alongside the frontend:

```
pnpm dev:all
```

Or separately:

```
pnpm dev:server    # backend on :3001
pnpm dev           # frontend on :8443
```

The Vite dev server proxies `/api/*` requests to the backend automatically.

## Project Structure

This is the canonical project structure. Start with task-relevant files below. Only follow imports or inspect other files when required, when a documented path is missing, or when the repository contradicts this guide.

- `src/main.tsx` - React entrypoint; imports `src/index.css` and mounts `src/App.tsx` into the `#root` element
- `src/App.tsx` - Primary application component and the usual starting point for UI work
- `src/index.css` - Global CSS entrypoint and Tailwind CSS v4 import
- `index.html` - Vite HTML shell containing the `#root` element and loading `src/main.tsx`
- `package.json` - Project dependencies and the Vite build, development, preview, and formatting scripts
- `vite.config.ts` - Vite configuration with React, Tailwind CSS v4, and Figma Make plugins plus the `@` alias for `src`
- `.mise.toml` - Toolchain versions for Node.js and pnpm
- `server/src/index.ts` - Hono API server entry point
- `server/src/routes/` - API route handlers (auth, businesses, whatsapp, social, ads, tracking, automations, export-trade, audit)
- `server/src/services/` - Business logic for external integrations
- `server/src/middleware/` - Auth (JWT), tenant isolation, audit logging middleware
- `server/src/db/` - SQLite database setup and schema (better-sqlite3)

## Dependencies

- Runtime: React 19 and React DOM 19
- Styling: Tailwind CSS v4 with the `@tailwindcss/vite` plugin
- Build tooling: Vite 8, TypeScript 5.7, and `@vitejs/plugin-react`
- Backend: Hono, better-sqlite3, bcryptjs, jsonwebtoken, zod, axios, cors
- Charts: Recharts
- Icons: Lucide React
- Formatting: oxfmt

## Styling

This project uses **Tailwind CSS v4** through the `@tailwindcss/vite` plugin configured in `vite.config.ts`. `src/index.css` imports Tailwind with `@import 'tailwindcss';`. Use Tailwind utility classes directly in JSX and put global CSS or Tailwind v4 theme customization in `src/index.css`. This scaffold does not need a Tailwind config file or PostCSS config.

`src/main.tsx` imports `src/index.css`, so global font wiring belongs in `src/index.css`. Keep CSS `@import` statements first, then add any `@font-face` rules and font-family defaults there.

## Code quality

- Use double quotes for strings containing apostrophes (`"We're here to help"`), or escape them in single-quoted strings. An unescaped apostrophe in a single-quoted string breaks the build.
- Ensure JSX tags are closed and braces are balanced.
- Export components as default exports.
