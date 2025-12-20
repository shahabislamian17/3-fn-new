// This file contains no Firebase imports

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
  base_target?: number;
  adjusted_target?: number;
  fee_applied?: boolean;
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
    cashflowUrl?: string;
    pnlUrl?: string;
    breakEven?: string;
    projections: { month: string; revenue: number; ebitda: number }[];
  };
  documents: { name: string; url: string }[];
  faqs: { question: string; answer: string }[];
  riskScore?: number;
  risk_level?: 'low' | 'medium' | 'high';
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  language: 'en' | 'fr' | 'es';
  meta_title: string;
  meta_description: string;
  keywords: string[];
  canonical_url: string;
  excerpt: string;
  content_markdown: string;
  hero_image_url: string;
  hero_image_hint: string;
  status: 'draft' | 'published';
  scheduled_for?: string;
  published_at?: string;
  seo_score?: number;
  primary_keyword: string;
  secondary_keywords: string[];
  createdAt: string;
  updatedAt: string;
};


export type UserRole = 
  | 'SuperAdmin'
  | 'Admin'
  | 'ProjectOwner'
  | 'Investor'
  | 'ComplianceOfficer'
  | 'Support'
  | 'AccountingOperator';

// We can extend the Firebase User type if we need to add more properties
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  country?: string;
  city?: string;
  role: UserRole;
  profile_type?: 'individual' | 'business';
  investor_class?: 'retail' | 'accredited' | 'institutional' | 'corporate';
  admin_level?: 'SuperAdmin' | 'Admin' | 'Compliance' | 'Support' | 'Accounting';
  parent_admin_id?: string;
  status?: 'active' | 'suspended';
  bio?: string;
  coverImageUrl?: string;
  coverImageHint?: string;
  avatarUrl?: string;
  avatarHint?: string;
  stripeAccountId?: string;
  stripeConnected?: boolean;
  stripe_onboard_status?: 'not_started' | 'pending' | 'completed' | 'rejected';
  // Investor Preferences
  preferred_countries?: string[];
  preferred_categories?: string[];
  preferred_investment_types?: ('Equity' | 'Royalty')[];
  min_investment?: number;
  max_investment?: number;
  risk_tolerance?: 'low' | 'medium' | 'high';
  ai_recommendation_opt_in?: boolean;
  last_notified_projects?: string[];
  // KYC/Verification
  kycStatus?: 'pending' | 'approved' | 'rejected' | 'not_started';
  kycSubmittedAt?: string;
  kycApprovedAt?: string;
  kycRejectedAt?: string;
  kycRejectionReason?: string;
  verification?: {
    [key: string]: any;
    status?: 'pending' | 'approved' | 'rejected';
    submittedAt?: string;
    reviewedAt?: string;
    reviewedBy?: string;
    reviewedByEmail?: string;
    reviewReason?: string;
  };
}

export type Investment = {
  id:string;
  project: Pick<Project, 'title' | 'slug' | 'type' | 'imageUrl' | 'imageHint' | 'repaymentMultiple'>;
  amount: number;
  platform_fee?: number;
  total_paid?: number;
  status: 'Active' | 'Completed';
  date: string;
  roi: number;
  ownership?: number;
  repaid?: number;
};

export type PlatformStats = {
  totalRaised: number;
  activeCampaigns: number;
  totalInvestors: number;
  successRate: number;
  commissionRevenue: number;
  pendingKYC: number;
  disputeQueue: number;
};

export type Notification = {
  id: string;
  userId: string;
  title: string;
  description: string;
  date: string;
  read: boolean;
};

export type SystemLog = {
  id: string;
  actor: { id: string; name: string; role: UserRole };
  action: string;
  entityType: 'User' | 'Project' | 'System' | 'Payout';
  entityId: string;
  timestamp: string;
  description: string;
  metadata?: Record<string, any>;
};

export type GatewayStatus = {
    name: string;
    status: 'Operational' | 'Degraded' | 'Offline';
};

export type TopCampaign = Pick<Project, 'id' | 'title' | 'raisedAmount' | 'targetAmount' | 'owner'>;

export type ComplianceTrigger = {
  id: string;
  user_id: string;
  project_id?: string;
  trigger_type: 'bypass_kyb_individual' | 'threshold_exceeded' | 'ai_flagged';
  payload: Record<string, any>;
  created_at: string;
};
