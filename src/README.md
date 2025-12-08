# 3JN CrowdFunding Platform

This is a full-stack, AI-powered crowdfunding platform built with Next.js, Genkit, and Firebase. It provides a multi-user environment for Project Owners to raise capital and for Investors to discover and fund innovative projects.

## Core Features

- **Dual Investment Models**: Supports both Equity and Royalty-based crowdfunding.
- **AI-Powered Tools**: A suite of Genkit-driven features to assist users:
  - For Owners: Campaign Pitch Generation, Financial Projections, Niche Finder, and Readiness Assessments.
  - For Investors: Personalized project recommendations and investment analysis.
- **Multi-Role Dashboards**: Tailored dashboards for Investors, Project Owners, and various Admin roles (Compliance, Support, etc.).
- **End-to-End Project Lifecycle**: A complete workflow from project creation and submission, through admin review and approval, to public listing.
- **Payment Integration**: Secure payment processing with Stripe.
- **Analytics & SEO**: Integrated Google Tag Manager and Facebook Pixel for analytics, with dynamic, AI-generated SEO for project pages.

## Getting Started

1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Set up environment variables**:
    Copy `.env.example` to `.env` and fill in your Firebase, Stripe, and Gemini API keys.
3.  **Run the development server**:
    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:3000`.
