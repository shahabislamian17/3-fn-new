// backend/src/types/newsletter.ts
export type NewsletterAudience =
  | "all_users"
  | "investors"
  | "project_owners"
  | "filtered_users";

export interface NewsletterFilters {
  country?: string;
  kycStatus?: "not_started" | "pending" | "passed" | "failed";
  minInvestmentCount?: number;
  maxInvestmentCount?: number;
  roles?: string[]; // e.g. ["investor", "project_owner"]
}

export interface NewsletterRequest {
  audience: NewsletterAudience;
  filters?: NewsletterFilters;
  topic: string;
  subject?: string;
  message: string;
  ctaUrl?: string;
  ctaLabel?: string;
  language?: "auto" | "en" | "fr";
}

export interface NewsletterDocument {
  id?: string;
  createdAt: Date;
  createdByUid: string | null;
  createdByEmail?: string | null;
  audience: NewsletterAudience;
  filters?: NewsletterFilters;
  topic: string;
  subject: string;
  message: string;
  html: string;
  ctaUrl?: string;
  ctaLabel?: string;
  language: "auto" | "en" | "fr";
  status: "queued" | "sending" | "sent" | "failed";
  sentAt?: Date;
  recipientCount?: number;
  errorMessage?: string | null;
}
