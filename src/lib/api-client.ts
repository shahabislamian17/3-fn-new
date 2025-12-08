// frontend/src/lib/api-client.ts
"use client";

import { getAuth } from "firebase/auth";
import { app } from "@/firebase/config";

const API_BASE_URL = "/api";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiRequestOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  auth?: boolean; // whether to attach Firebase ID token
}

export async function apiRequest<T = unknown>(
  path: string,
  { method = "GET", headers = {}, body, auth = true }: ApiRequestOptions = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  // Attach Firebase ID token if auth = true and user is logged in
  if (auth) {
    const authInstance = getAuth(app);
    const user = authInstance.currentUser;
    if (!user) {
      throw new Error("Not authenticated");
    }

    const idToken = await user.getIdToken();
    finalHeaders["Authorization"] = `Bearer ${idToken}`;
  }

  const res = await fetch(url, {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let errorMessage = `API request failed with status ${res.status}`;
    try {
      const errJson = await res.json();
      if (errJson.error) errorMessage = errJson.error;
      if (errJson.code) (errorMessage as any).code = errJson.code;
    } catch {
      // ignore JSON parse errors
    }
    const error = new Error(errorMessage);
    if ((errorMessage as any).code) {
      (error as any).code = (errorMessage as any).code;
    }
    throw error;
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

export const fetcher = (path: string) => apiRequest(path);