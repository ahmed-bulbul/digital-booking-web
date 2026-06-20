export type ApiError = {
  code?: string;
  message?: string;
};

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: ApiError;
};

export type AuthResponse = {
  token: string;
  userId: number;
  role: number | string;
};

export type CurrentUser = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  phone?: string;
  password: string;
};

export type OrganizationRegisterPayload = {
  contactName: string;
  adminEmail: string;
  adminPhone?: string;
  organizationName: string;
  organizationDomain?: string;
};

export type OrganizationRegistrationResponse = {
  organizationId: number;
  status: string;
};

export type RoleLabel = "USER" | "ADMIN" | "AGENT" | "PROVIDER" | "SUPER_ADMIN" | "UNKNOWN";

import { API_BASE_URL } from "./config";
export { API_BASE_URL };

export async function login(payload: LoginPayload) {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorPayload = await safeJson<ApiResponse<unknown>>(res);
    throw new Error(errorPayload?.error?.message ?? "Login failed");
  }

  const data = (await res.json()) as ApiResponse<AuthResponse>;
  return data.data;
}

export async function loginAdmin(payload: LoginPayload) {
  const res = await fetch(`${API_BASE_URL}/api/auth/login-admin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorPayload = await safeJson<ApiResponse<unknown>>(res);
    throw new Error(errorPayload?.error?.message ?? "Login failed");
  }

  const data = (await res.json()) as ApiResponse<AuthResponse>;
  return data.data;
}

export async function loginSuperAdmin(payload: LoginPayload) {
  const res = await fetch(`${API_BASE_URL}/api/auth/login-super-admin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorPayload = await safeJson<ApiResponse<unknown>>(res);
    throw new Error(errorPayload?.error?.message ?? "Login failed");
  }

  const data = (await res.json()) as ApiResponse<AuthResponse>;
  return data.data;
}

export async function registerPassenger(payload: RegisterPayload) {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorPayload = await safeJson<ApiResponse<unknown>>(res);
    throw new Error(errorPayload?.error?.message ?? "Registration failed");
  }

  const data = (await res.json()) as ApiResponse<AuthResponse>;
  return data.data;
}

export async function registerOrganization(payload: OrganizationRegisterPayload) {
  const res = await fetch(`${API_BASE_URL}/api/auth/register-organization`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorPayload = await safeJson<ApiResponse<unknown>>(res);
    throw new Error(errorPayload?.error?.message ?? "Registration failed");
  }

  const data = (await res.json()) as ApiResponse<OrganizationRegistrationResponse>;
  return data.data;
}

export function resolveRoleLabel(role: number | string): RoleLabel {
  if (typeof role === "number") {
    if (role === 1) return "USER";
    if (role === 2) return "ADMIN";
    if (role === 3) return "AGENT";
    if (role === 4) return "PROVIDER";
    if (role === 5) return "SUPER_ADMIN";
    return "UNKNOWN";
  }
  const normalized = role.toUpperCase();
  if (normalized === "USER") return "USER";
  if (normalized === "ADMIN") return "ADMIN";
  if (normalized === "AGENT") return "AGENT";
  if (normalized === "PROVIDER") return "PROVIDER";
  if (normalized === "SUPER_ADMIN") return "SUPER_ADMIN";
  return "UNKNOWN";
}

export function storeAuth(auth: AuthResponse) {
  if (typeof window === "undefined") return;
  const roleLabel = resolveRoleLabel(auth.role);
  localStorage.setItem("auth_token", auth.token);
  localStorage.setItem("auth_user_id", String(auth.userId));
  localStorage.setItem("auth_role", roleLabel);
  return roleLabel;
}

export function getStoredToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

export function getStoredRole(): RoleLabel | null {
  if (typeof window === "undefined") return null;
  const role = localStorage.getItem("auth_role");
  return role ? (role as RoleLabel) : null;
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user_id");
  localStorage.removeItem("auth_role");
  localStorage.removeItem("auth_remember");
}

export async function getCurrentUser() {
  const res = await authFetch(`${API_BASE_URL}/api/users/me`, {
    method: "GET"
  });

  if (!res.ok) {
    const errorPayload = await safeJson<ApiResponse<unknown>>(res);
    throw new Error(errorPayload?.error?.message ?? "Failed to load user profile");
  }

  const payload = (await res.json()) as ApiResponse<CurrentUser>;
  return payload.data;
}

export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  const token = getStoredToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(input, { ...init, headers });
}

async function safeJson<T>(res: Response) {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
