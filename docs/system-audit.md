# System Audit & Refactor Plan

This document outlines the current state of the 3JN Fund codebase and identifies areas for cleanup, stabilization, and optimization.

## 1. Application Inventory

The system consists of a single, monolithic **Next.js application**.

-   **Frontend**: A React application built with the Next.js App Router, located in `src/app`. It uses ShadCN for UI components and TailwindCSS for styling.
-   **Backend**: A series of API routes co-located with the frontend under `src/app/api`.
-   **AI Services**: All AI functionality is handled server-side via Genkit flows located in `src/ai/flows`.
-   **Databases/Services**:
    -   **Authentication**: Firebase Authentication.
    -   **Database**: Firestore (as per `firestore.rules`, but UI is not yet fully connected).
    -   **Payment Gateways**: Stripe (Connected Accounts, Checkout).

## 2. User Roles

The platform is designed for the following roles, managed via `src/lib/types.ts`:

-   **SuperAdmin / Admin**: Full platform oversight.
-   **ProjectOwner**: Creates and manages fundraising campaigns.
-   **Investor**: Discovers and invests in projects.
-   **ComplianceOfficer**: Reviews KYC/AML and compliance runs.
-   **Support**: Manages user tickets and disputes.
-   **AccountingOperator**: Handles payouts and commissions.

## 3. Route & Screen Map

### Backend API Routes (`/api`)

-   **Admin Routes (`/api/admin/*`)**:
    -   `/api/admin/match-projects`: **Looks Active**. Runs AI matching for a single project.
    -   `/api/admin/match-projects/all`: **Looks Active**. Runs bulk AI matching.
    -   `/api/admin/projects`: **Looks Active**. Returns mock project data.

-   **AI Routes (`/api/ai-chat`)**:
    -   `/api/ai-chat`: **Looks Active**. Powers the AI chatbot component.

-   **Payment Gateway Routes**:
    -   `/api/checkout_sessions`: **Looks Active**. Creates Stripe Checkout sessions. **(Recently cleaned to be one-time payment only)**.
    -   `/api/stripe/create-account-link`: **Looks Active**.
    -   `/api/stripe/create-connected-account`: **Looks Active**.
    -   `/api/webhooks/stripe`: **Looks Active**. Handles Stripe webhooks.

-   **Data Routes**:
    -   `/api/landing-data`: **Looks Active**. Serves stats and testimonials for the homepage.
    -   `/api/notifications`: **Looks Active**. Serves user notifications.
    -   `/api/projects`: **Looks Active**. Serves a list of live projects.
    -   `/api/user/campaigns`: **Looks Active**. Serves campaigns for a specific owner.
    -   `/api/user/investments`: **Looks Active**. Serves investments for a specific investor.

-   **Dead/Removed Routes**:
    -   `/api/escrow/trigger-release`: **Removed**. Part of the old, disconnected worker system.
    -   All Bitripay and Plaid routes have been removed.

### Frontend Pages & Screens (`/app`)

-   **Public Pages**:
    -   `/`: Homepage - **Working**. Fetches dynamic data.
    -   `/about`: **Working**. Static content.
    -   `/blog`, `/blog/[slug]`: **Working**. Uses mock data. Needs to be connected to a dynamic source.
    -   `/contact`: **Working**. Static content.
    -   `/fee-policy`, `/privacy`, `/risks`, `/terms`: **Working**. Static legal pages.
    -   `/how-it-works`: **Working**. Static content.
    -   `/learn`: **Working**. Static content with mock charts.
    -   `/pricing`: **Working**. Static content.
    -   `/projects`, `/projects/[slug]`: **Working**. Fetches dynamic data.
    -   `/login`, `/signup`: **Working**. Integrated with Firebase Auth.

-   **Dashboard Pages (`/dashboard`)**:
    -   `/dashboard`: **Working**. Main router that displays the correct dashboard based on user role.
    -   `/dashboard/account`: **Working**. User profile and settings management.
    -   `/dashboard/portfolio`: **Working**. Displays investments for Investors and campaigns for Project Owners. Fetches dynamic data.
    -   `/dashboard/transactions`: **Working**. Shows a unified transaction ledger for investors. Uses mock data.
    -   **AI Tools for Owners**:
        -   `/dashboard/create-campaign`: **Working**. AI pitch generator.
        -   `/dashboard/create-project`: **Working**. Multi-step project creation wizard.
        -   `/dashboard/financial-projections`: **Working**. AI financial modeling tool.
        -   `/dashboard/niche-finder`: **Working**. AI market opportunity explorer.
        -   `/dashboard/readiness`: **Working**. AI investment readiness assessment.
        -   `/dashboard/suggest-terms`: **Working**. AI funding terms suggestion tool.

-   **Admin Pages (`/dashboard/admin`)**:
    -   Most admin pages are **Partially Working**. They render correctly but are powered by mock data and stubbed API actions.
    -   `/dashboard/admin/approvals`: Displays campaign/KYC approval queues.
    -   `/dashboard/admin/commissions`: Displays commission revenue.
    -   `/dashboard/admin/compliance`, `/dashboard/admin/compliance/[runId]`: Displays and details compliance runs.
    -   `/dashboard/admin/content`: An AI-powered blog post generator and manager.
    -   `/dashboard/admin/matching`: AI-powered investor-to-project matching tool.
    -   `/dashboard/admin/payouts`: Payout management dashboard (Stripe).
    -   `/dashboard/admin/settings`: Global platform configuration.
    -   `/dashboard/admin/support`: Support ticket and dispute management.
    -   `/dashboard/admin/users`: Admin user management.

## 4. Data Models & UI Connectivity

-   **Main Collections (implied by `src/lib/types.ts`)**:
    -   `users`: Stores user profile data, roles, and preferences. **Partially Connected** (auth works, but profile saving/loading is needed).
    -   `projects`: Stores campaign data. **Partially Connected** (UI reads from a mock-data API, but does not write).
    -   `investments`: Stores investment records. **Partially Connected** (UI reads from a mock-data API).
    -   `notifications`: **Connected** via an API endpoint.
    -   `compliance_runs`, `documents`, `ai_jobs`, `payouts`: These models are implied by the admin UI and worker code but are **Not Connected** to the UI or a database.

## 5. Summary & Recommendations

-   **What's Dead/Redundant**:
    -   The entire `worker` system and its dependencies (`bullmq`, `pg`) were correctly identified and removed. It was a separate, non-integrated system.
    -   The `test` directory was also related to this worker system and was removed.

-   **What to Fix Next**:
    1.  **Database Connectivity**: The highest priority is to fully connect the UI to Firestore. This involves creating services to `get`, `list`, and `create` documents for `projects`, `users`, and `investments`.
    2.  **Auth & User Profiles**: The signup/login flow works, but user profile data (role, preferences, etc.) is not being saved to or loaded from the database. This is a critical next step.
    3.  **End-to-End Flows**: The "Create Project" flow needs to be connected to actually save a new project document in the database. The "Invest" flow needs to create an `investment` document.

-   **What Can Be Removed**:
    -   The `mockUsers`, `mockAssetContent`, etc., in `src/lib/data.ts` can be removed once their corresponding features are fully connected to the database. For now, they are powering the partially-working admin dashboards and should be kept temporarily.
