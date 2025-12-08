# Removed Modules & Code

This document logs the major components and files that have been removed from the codebase during the deep clean-up phase.

## 1. Standalone Worker System (`/worker` directory)

-   **Files Removed**:
    -   `worker/processor.js`
    -   `worker/publisher.js`
    -   `worker/releaseEscrowWorker.js`
    -   (and associated config, logger, db, etc. files if they existed)

-   **Reason for Removal**:
    -   The entire `/worker` directory contained a separate, standalone Node.js application that was not integrated with the main Next.js frontend or backend.
    -   It used its own database connection (`pg`), job queue (`bullmq`), and ran as a separate process.
    -   This system was responsible for post-funding AI jobs (marketing, legal docs) and escrow release, but it was completely disconnected from the live application's data flow and UI.
    -   Removing it eliminates a significant source of confusion, conflicting dependencies, and dead code, allowing us to rebuild this logic correctly within the Next.js and Genkit framework.

## 2. Unused API Routes

-   **File Removed**: `src/app/api/escrow/trigger-release/route.ts`

-   **Reason for Removal**:
    -   This API endpoint's sole purpose was to trigger a job in the `bullmq` worker system that has been removed.
    -   With the worker gone, this route is now a dead end and serves no purpose.

## 3. Redundant Test Directory

-   **Files Removed**: All files within the `/test` directory.

-   **Reason for Removal**:
    -   The tests in this directory were specifically for the standalone worker system and its database interactions. They are not relevant to the Next.js application.

## 4. Unused NPM Packages

-   **Packages Removed**:
    -   `bullmq`
    -   `ioredis`
    -   `pg`
    -   `axios`
    -   `piscina`

-   **Reason for Removal**:
    -   These packages were exclusively used by the now-removed worker system. Removing them lightens the project's dependencies and reduces `node_modules` size.
