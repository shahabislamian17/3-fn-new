// frontend/src/lib/api-frontend-services.ts
import { apiRequest } from "./api-client";
import type { Project, Investment, Notification } from "./types";

// ==== Stripe / Payments ====

export async function createStripeConnectAccount() {
  return apiRequest<{ accountId: string }>("/stripe/create-connected-account", {
    method: "POST",
  });
}

export async function createStripeOnboardingLink() {
  return apiRequest<{ url: string }>("/stripe/create-onboarding-link", {
    method: "POST",
  });
}

// ==== Plaid ====

export async function createPlaidLinkToken() {
  return apiRequest<{ link_token: string }>("/plaid/create-link-token", {
    method: "POST",
  });
}

export async function exchangePlaidPublicToken(public_token: string) {
  return apiRequest<{
    access_token: string;
    item_id: string;
  }>("/plaid/exchange-public-token", {
    method: "POST",
    body: { public_token },
  });
}

// ==== Projects ====

export async function createProject(payload: Partial<Project>): Promise<Project> {
  return apiRequest("/projects", {
    method: "POST",
    body: payload,
  });
}

export async function getPublicProjects(): Promise<Project[]> {
  return apiRequest(`/projects`, {
    method: "GET",
    auth: false, // public
  });
}

export async function getPublicProject(slug: string): Promise<Project> {
  return apiRequest(`/projects/${slug}`, {
    method: "GET",
    auth: false, // public
  });
}

// ==== Investments ====
export async function createInvestment(projectId: string, amount: number): Promise<Investment> {
  return apiRequest('/investments', {
    method: 'POST',
    body: { projectId, amount }
  });
}

// ==== User / Portfolio ====

export async function getUserInvestments() {
  return apiRequest<{ investments: any[] }>("/user/investments", {
    method: "GET",
  });
}

export async function getUserCampaigns() {
  return apiRequest<{ campaigns: any[] }>("/user/campaigns", {
    method: "GET",
  });
}

export async function getNotifications() {
    return apiRequest<Notification[]>('/notifications', { method: 'GET' });
}


// ==== Admin ====

export async function adminListAllProjects() {
  return apiRequest<{ projects: any[] }>("/admin/projects", {
    method: "GET",
  });
}

export async function adminApproveProject(projectId: string) {
  return apiRequest(`/admin/projects/${projectId}/approve`, {
    method: "POST",
  });
}

export async function getAutoApprovalStats() {
    return apiRequest("/admin/auto-approval/stats", { method: "GET" });
}

export async function getAutoApprovalHistory() {
    return apiRequest("/admin/auto-approval/history", { method: "GET" });
}
