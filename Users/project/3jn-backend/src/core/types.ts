// This file contains types shared across the backend service.
// It is COPIED from the frontend's src/lib/types.ts to avoid import issues.

export type Project = {
  id: string;
  slug: string;
  owner: {
    id:string;
    name: string;
    avatarUrl: string;
    avatarHint: string;
  };
  title: string;
  category: string;
  investmentStage: string;
  location: string;
  type: 'Equity' | 'Royalty';
  status?: 'draft' | 'submitted' | 'live' | 'funded' | 'closed' | 'rejected' | 'funded_pending_checks' | 'funded_documents_sent' | 'blocked';
  currency: string;
  targetAmount: number;
  raisedAmount: number;
  investorCount: number;
  minTicket: number;
  valuation?: number;
  equityOffered?: number;
  royaltyRate?: number;
  repaymentMultiple?: number;
  endDate: string;
  imageUrl: string;
  imageHint: string;
  shortDescription: string;
  longDescription: string;
  financials: {
    projections: { month: string; revenue: number; ebitda: number }[];
  };
  documents: { name: string; url: string }[];
  faqs: { question: string; answer: string }[];
};

export type UserRole = 
  | 'SuperAdmin'
  | 'Admin'
  | 'ProjectOwner'
  | 'Investor'
  | 'ComplianceOfficer'
  | 'Support'
  | 'AccountingOperator';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  bio?: string;
  avatarUrl?: string;
  avatarHint?: string;
  stripeAccountId?: string;
  stripeConnected?: boolean;
  stripe_onboard_status?: 'not_started' | 'pending' | 'completed' | 'rejected';
  // Investor Preferences
  preferred_countries?: string[];
  preferred_categories?: string[];
  preferred_investment_types?: ('Equity' | 'Royalty')[];
  risk_tolerance?: 'low' | 'medium' | 'high';
}

export type Investment = {
  id:string;
  userId: string;
  project: Pick<Project, 'title' | 'slug' | 'type' | 'imageUrl' | 'imageHint' | 'repaymentMultiple'>;
  amount: number;
  status: 'Active' | 'Completed';
  date: string;
  roi: number;
  ownership?: number;
  repaid?: number;
};


export type Notification = {
  id: string;
  userId: string;
  title: string;
  description: string;
  date: string;
  read: boolean;
};
