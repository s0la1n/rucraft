export const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export const getBackendBaseUrl = () => {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";
  // Обрезаем суффикс /api, чтобы получить базовый URL бэкенда для статики
  return apiBase.replace(/\/api\/?$/, "");
};

export const resolveAssetUrl = (path?: string | null): string | null => {
  if (!path) return null;
  // Если уже полный URL — возвращаем как есть
  if (/^(?:https?:)?\/\//.test(path)) return path;

  const backendBase = getBackendBaseUrl().replace(/\/$/, "");
  const raw = path.replace(/^\/+/, "");
  const withStoragePrefix = raw.startsWith("storage/") ? raw : `storage/${raw}`;
  const normalizedPath = `/${withStoragePrefix}`;
  return `${backendBase}${normalizedPath}`;
};

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

// ——— Profile ———

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

// ——— Content: builds / mods / seeds / skins ———

export type ContentAuthor = {
  id: number;
  name: string;
};

export type ListItemBase = {
  id: number;
  title: string;
  image?: string | null;
  created_at: string;
  author: ContentAuthor;
};

export type BuildBlock = {
  name: string;
  count: number;
};

export type BuildPost = {
  id: number;
  title: string;
  image?: string | null;
  image_url?: string | null;
  description?: string | null;
  images: string[];
  blocks: BuildBlock[];
  file_url?: string | null;
  author: ContentAuthor;
  created_at: string;
};

export type ModPost = {
  id: number;
  title: string;
  image?: string | null;
  image_url?: string | null;
  description?: string | null;
  images: string[];
  file_url: string;
  author: ContentAuthor;
  created_at: string;
};

export type SeedPost = {
  id: number;
  title: string;
  image?: string | null;
  image_url?: string | null;
  images?: string[];
  seed: string;
  version: "java" | "bedrock" | "both";
  release: string;
  x: number;
  y: number;
  z: number;
  author: ContentAuthor;
  created_at: string;
};

export type SkinPost = {
  id: number;
  title: string;
  image?: string | null;
  category: "funny" | "girls" | "boys" | "anime" | string;
  image_url?: string | null;
  file_url?: string | null;
  author: ContentAuthor;
  created_at: string;
};

export type ShowResponse<T> = {
  data: T;
};

export const buildsApi = {
  index: () => apiFetch<{ data: BuildPost[] }>("builds"),
  show: (id: number) => apiFetch<ShowResponse<BuildPost>>(`builds/${id}`),
};

export const modsApi = {
  index: () => apiFetch<{ data: ModPost[] }>("mods"),
  show: (id: number) => apiFetch<ShowResponse<ModPost>>(`mods/${id}`),
};

export const seedsApi = {
  index: () => apiFetch<{ data: SeedPost[] }>("seeds"),
  show: (id: number) => apiFetch<ShowResponse<SeedPost>>(`seeds/${id}`),
};

export type SkinsIndexResponse = {
  data: SkinPost[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export type CreateSkinResponse = { message: string; data: { id: number; title: string; category: string } };

export const skinsApi = {
  index: (params?: { page?: number; category?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.category) q.set("category", params.category);
    const query = q.toString();
    return apiFetch<SkinsIndexResponse>(`skins${query ? `?${query}` : ""}`);
  },
  show: (id: number) => apiFetch<ShowResponse<SkinPost>>(`skins/${id}`),
  create: (formData: FormData) => {
    const base = getBaseUrl().replace(/\/$/, "");
    const token = typeof window !== "undefined" ? localStorage.getItem("rucraft_token") : null;
    return fetch(`${base}/skins`, {
      method: "POST",
      headers: { Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: formData,
    }).then(async (res) => {
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { message?: string }).message ?? String(res.status));
      return data as CreateSkinResponse;
    });
  },
};
