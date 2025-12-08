# Monolith to Microservice Migration Plan

This document outlines the file-by-file plan for separating the monolithic Next.js application into a dedicated frontend and a new backend service.

## 1. New Backend Service (`3jn-backend`)

A new directory, `3jn-backend`, will be created. It will be a standard Node.js/Express application written in TypeScript.

### Moved & Transformed Files:

The following logic, previously in `src/app/api`, `src/ai`, `src/lib`, and `src/services`, will be moved and adapted for the Express backend.

- **`src/app/api/` -> `3jn-backend/src/controllers/`**: All Next.js API route handlers are transformed into Express controllers.
  - `admin/match-projects/all/route.ts` -> `match.controller.ts`
  - `auth/login/route.ts` -> `auth.controller.ts`
  - `notifications/route.ts` -> `notifications.controller.ts`
  - `projects/route.ts` -> `projects.controller.ts`
  - `user/campaigns/route.ts` -> `user.controller.ts`
  - `user/investments/route.ts` -> `user.controller.ts`
  - `stripe/` -> `stripe.controller.ts`
  - `plaid/` -> `plaid.controller.ts`

- **`src/ai/` -> `3jn-backend/src/ai/`**: The Genkit AI flows are moved directly to the backend. They are now services called by controllers.

- **`src/lib/` -> `3jn-backend/src/core/`**: Core server-side logic is moved.
  - `firebase-admin.ts` -> `firebase.ts`
  - `server-auth.ts` -> `auth.ts`
  - `rbac.ts` -> `rbac.ts`
  - `stripe.ts`, `plaid.ts` -> moved to `core/`
  - `types.ts` will be **COPIED** to both frontend and backend to ensure type consistency.

- **`src/services/` -> `3jn-backend/src/services/`**: Database services are moved directly.

### New Backend Files:

- `3jn-backend/package.json`: Defines all backend dependencies (Express, cors, etc.).
- `3jn-backend/tsconfig.json`: TypeScript configuration for the backend.
- `3jn-backend/src/app.ts`: Main Express application setup.
- `3jn-backend/src/routes/`: Defines API routes and links them to controllers.
- `3jn-backend/src/middleware/`: Contains authentication and error handling middleware.
- `3jn-backend/Dockerfile`: To containerize the backend for deployment.
- `.github/workflows/backend-cicd.yml`: GitHub Actions for the backend.

## 2. Updated Frontend Application (`3jn-frontend`)

The existing application is now the frontend. It will be heavily modified.

### Removed Files & Directories:

- `src/app/api/`: The entire API directory is deleted.
- `src/ai/`: The entire AI flows directory is deleted.
- `src/lib/firebase-admin.ts`, `src/lib/server-auth.ts`, `src/lib/rbac.ts`, `src/lib/stripe.ts`, `src/lib/plaid.ts`: All server-specific files are removed.
- `src/services/`: All database service files are removed.

### Modified Files:

- **All UI Components (`src/app/dashboard/...`, `src/components/...`)**: All components that previously used server-side functions or direct API calls are modified to use `fetch` with the new backend API URL (`process.env.NEXT_PUBLIC_API_BASE_URL`). Authentication will be handled by the browser's `credentials: 'include'` flag, which automatically sends the `HttpOnly` session cookie.
- `src/firebase/auth/use-auth.ts`: The `login` and `logout` functions are updated to call the new backend endpoints (`/api/v1/auth/login`, `/api/v1/auth/logout`).
- `src/middleware.ts`: This file is updated to protect all `/dashboard` routes by checking for a valid session cookie.
- `package.json`: Server-side dependencies (`firebase-admin`, `stripe`, `plaid`, etc.) are removed.
- `next.config.ts`: Updated to include the backend API URL for rewrites during local development.

This separation creates a clear, scalable, and secure architecture ready for production deployment.
