const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export type ApiError = { message: string; errors?: Record<string, string[]> };

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("rucraft_token");
}

export function setAuthToken(token: string): void {
  if (typeof window !== "undefined") localStorage.setItem("rucraft_token", token);
}

export function clearAuthToken(): void {
  if (typeof window !== "undefined") localStorage.removeItem("rucraft_token");
}

export async function apiFetch<T = unknown>(
  path: string,
  options?: RequestInit & { token?: string | null }
): Promise<T> {
  const { token: optToken, ...rest } = options ?? {};
  const token = optToken ?? getToken();
  const url = `${getBaseUrl().replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
  const res = await fetch(url, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...rest.headers,
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({})) as ApiError & { errors?: Record<string, string[]> };
    const msg =
      data.message ??
      (data.errors ? Object.values(data.errors).flat().join(", ") : null) ??
      `${res.status} ${res.statusText}`;
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

export type PingResponse = {
  ok: boolean;
  message: string;
  timestamp: string;
};

export async function ping(): Promise<PingResponse> {
  return apiFetch<PingResponse>("ping");
}

// ——— Auth ———

export type User = {
  id: number;
  name: string;
  login: string;
  email: string;
  role: string;
};

export type LoginResponse = { user: User; token: string; message: string };
export type RegisterResponse = { user: User; token: string; message: string };
export type UserResponse = { user: User };

export const authApi = {
  register: (body: {
    name: string;
    login: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) =>
    apiFetch<RegisterResponse>("register", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  login: (body: { login: string; password: string }) =>
    apiFetch<LoginResponse>("login", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  logout: () =>
    apiFetch<{ message: string }>("logout", {
      method: "POST",
      token: getToken(),
    }),

  me: () =>
    apiFetch<UserResponse>("user", {
      token: getToken(),
    }),
};

export const profileApi = {
  show: () =>
    apiFetch<UserResponse>("profile", { token: getToken() }),
  update: (body: {
    name?: string;
    login?: string;
    email?: string;
    password?: string;
    password_confirmation?: string;
  }) =>
    apiFetch<UserResponse & { message: string }>("profile", {
      method: "PUT",
      body: JSON.stringify(body),
      token: getToken(),
    }),
};

export const adminApi = {
  users: (params?: { per_page?: number; page?: number }) => {
    const q = new URLSearchParams();
    if (params?.per_page) q.set("per_page", String(params.per_page));
    if (params?.page) q.set("page", String(params.page));
    const query = q.toString();
    return apiFetch<{
      data: Array<{ id: number; name: string; login: string; email: string; role: string; is_banned: boolean; created_at: string }>;
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    }>(`admin/users${query ? `?${query}` : ""}`, { token: getToken() });
  },
  banUser: (userId: number) =>
    apiFetch<{ message: string; user: unknown }>(`admin/users/${userId}/ban`, {
      method: "POST",
      token: getToken(),
    }),
  unbanUser: (userId: number) =>
    apiFetch<{ message: string; user: unknown }>(`admin/users/${userId}/unban`, {
      method: "POST",
      token: getToken(),
    }),
};
