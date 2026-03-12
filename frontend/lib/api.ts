// lib/api.ts

export const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export const getBackendBaseUrl = () => {
  const apiBase = getBaseUrl();
  return String(apiBase).replace(/\/api\/?$/, "");
};

// Твоя функция resolveAssetUrl
export const resolveAssetUrl = (path?: string | null, type: string = 'skins'): string | null => {
  // Безопасная проверка
  if (path === null || path === undefined) {
    console.log('[resolveAssetUrl] Path is null or undefined');
    return null;
  }

  if (typeof path !== 'string') {
    console.log('[resolveAssetUrl] Path is not a string:', typeof path);
    return null;
  }

  const cleanPath = path.trim();
  if (!cleanPath || cleanPath === "null" || cleanPath === "undefined") {
    console.log('[resolveAssetUrl] Empty or invalid path');
    return null;
  }

  if (/^(?:https?:)?\/\//.test(cleanPath) && !cleanPath.includes('localhost:8000')) {
    return cleanPath;
  }

  // Если это уже полный URL localhost:8000
  if (cleanPath.includes('localhost:8000')) {
    return cleanPath;
  }

  // Извлекаем имя файла из пути (например, "skins/abc.png" -> "abc.png")
  const filename = cleanPath.split('/').pop() || '';

  // Используем универсальный маршрут для контента
  return `/content-image/${encodeURIComponent(type)}/${encodeURIComponent(filename)}`;
};

// Чужая функция resolveStorageUrl
export const resolveStorageUrl = (path?: string | null): string | null => {
  if (path === null || path === undefined) {
    console.log("[resolveStorageUrl] Path is null or undefined");
    return null;
  }

  if (typeof path !== "string") {
    console.log("[resolveStorageUrl] Path is not a string:", typeof path);
    return null;
  }

  const cleanPath = path.trim();
  if (!cleanPath || cleanPath === "null" || cleanPath === "undefined") {
    console.log("[resolveStorageUrl] Empty or invalid path");
    return null;
  }

  // Если уже полный HTTP(S) или относительный корневой URL - отдаем как есть
  if (/^(?:https?:)?\/\//.test(cleanPath)) {
    return cleanPath;
  }

  const backendBase = getBackendBaseUrl().replace(/\/$/, "");

  // Если путь уже начинается с /storage или storage, не дублируем префикс
  const storagePath = cleanPath.replace(/^\/?storage\/?/, "");

  return `${backendBase}/storage/${storagePath}`;
};

// Функция для получения абсолютного URL для изображений (нужна для skinview3d)
export const getAbsoluteAssetUrl = (path?: string | null, type: string = 'skins'): string | null => {
  const relative = resolveAssetUrl(path, type);
  if (!relative) return null;
  
  // Если это уже абсолютный URL
  if (relative.startsWith('http')) {
    return relative;
  }
  
  // Добавляем базовый URL бэкенда
  const backendUrl = getBackendBaseUrl().replace(/\/$/, "");
  return `${backendUrl}${relative}`;
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

// Функция для получения CSRF cookie
export async function getCsrfCookie(): Promise<boolean> {
  const baseUrl = getBackendBaseUrl();
  const url = `${baseUrl}/sanctum/csrf-cookie`;
  
  console.log('[CSRF] Getting cookie from:', url);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    
    console.log('[CSRF] Response status:', response.status);
    
    if (!response.ok) {
      console.error('[CSRF] Failed:', await response.text());
      return false;
    }
    
    // Проверяем, установились ли cookies
    const cookies = document.cookie;
    console.log('[CSRF] Document cookies after request:', cookies);
    
    // Ждем установки cookie
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Проверяем наличие XSRF-TOKEN
    const hasXsrfToken = cookies.includes('XSRF-TOKEN=');
    console.log('[CSRF] Has XSRF-TOKEN:', hasXsrfToken);
    
    return true;
    
  } catch (error) {
    console.error('[CSRF] Error:', error);
    return false;
  }
}

// Функция apiFetch с поддержкой FormData
export async function apiFetch<T = unknown>(
  path: string,
  options?: RequestInit & { token?: string | null; requiresCsrf?: boolean; isFormData?: boolean }
): Promise<T> {
  const { token: optToken, requiresCsrf, isFormData, ...rest } = options ?? {};
  const token = optToken ?? getToken();
  
  const url = `${getBaseUrl().replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
  
  console.log(`[API] Fetching ${url}, requiresCsrf: ${requiresCsrf}, isFormData: ${isFormData}`);
  
  // Для маршрутов, требующих CSRF
  let xsrfToken: string | null = null;
  if (requiresCsrf) {
    console.log('[API] Getting CSRF cookie for:', path);
    await getCsrfCookie();
    
    // Извлекаем XSRF-TOKEN из cookie
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'XSRF-TOKEN') {
        xsrfToken = decodeURIComponent(value);
        console.log('[API] Found XSRF token in cookies');
        break;
      }
    }
  }
  
  const headers: Record<string, string> = {
    "Accept": "application/json",
    "X-Requested-With": "XMLHttpRequest",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...rest.headers as Record<string, string>,
  };
  
  // Для FormData не устанавливаем Content-Type
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }
  
  // Добавляем XSRF-TOKEN в заголовок для Laravel
  if (xsrfToken) {
    headers['X-XSRF-TOKEN'] = xsrfToken;
    console.log('[API] Added X-XSRF-TOKEN header');
  }
  
  const fetchOptions: RequestInit = {
    ...rest,
    credentials: 'include',
    headers,
  };
  
  // Для FormData не нужно преобразовывать body
  if (!isFormData && rest.body && typeof rest.body !== 'string') {
    fetchOptions.body = JSON.stringify(rest.body);
  }
  
  try {
    const res = await fetch(url, fetchOptions);
    console.log(`[API] Response status: ${res.status} for ${path}`);
    
    if (!res.ok) {
      // Пробуем получить тело ошибки
      let errorData: any = {};
      try {
        errorData = await res.json();
        console.log('[API] Error data:', errorData);
      } catch {
        const text = await res.text();
        console.log('[API] Error text:', text);
      }
      
      if (res.status === 419) {
        console.error('[API] CSRF token error');
        
        if (requiresCsrf) {
          console.log('[API] Retrying once with fresh CSRF token...');
          
          // Получаем новый CSRF cookie и токен
          await getCsrfCookie();
          
          // Извлекаем новый токен
          let newXsrfToken: string | null = null;
          const cookies = document.cookie.split(';');
          for (const cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'XSRF-TOKEN') {
              newXsrfToken = decodeURIComponent(value);
              break;
            }
          }
          
          // Обновляем заголовок
          if (newXsrfToken) {
            headers['X-XSRF-TOKEN'] = newXsrfToken;
          }
          
          // Пробуем еще раз
          const retryRes = await fetch(url, {
            ...fetchOptions,
            headers, // Используем обновленные заголовки
          });
          console.log(`[API] Retry response status: ${retryRes.status}`);
          
          if (retryRes.ok) {
            return retryRes.json() as Promise<T>;
          }
          
          // Если повторный запрос тоже не удался
          let retryErrorData: any = {};
          try {
            retryErrorData = await retryRes.json();
          } catch {
            // игнорируем
          }
          
          const retryMsg = retryErrorData.message || 
                          (retryErrorData.errors ? Object.values(retryErrorData.errors).flat().join(", ") : null) ||
                          `${retryRes.status} ${retryRes.statusText}`;
          throw new Error(retryMsg);
        }
      }
      
      const msg = errorData.message ||
                 (errorData.errors ? Object.values(errorData.errors).flat().join(", ") : null) ||
                 `${res.status} ${res.statusText}`;
      throw new Error(msg);
    }
    
    return res.json() as Promise<T>;
    
  } catch (error) {
    console.error('[API] Fetch error:', error);
    throw error;
  }
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
      requiresCsrf: true,
    }),

  login: (body: { login: string; password: string }) =>
    apiFetch<LoginResponse>("login", {
      method: "POST",
      body: JSON.stringify(body),
      requiresCsrf: true,
    }),

  logout: () =>
    apiFetch<{ message: string }>("logout", {
      method: "POST",
      token: getToken(),
      requiresCsrf: true,
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
  instructions?: string | null;
  images: string[];
  blocks?: Array<{ name: string; count: number }>;
  file_url: string;
  author: ContentAuthor;
  created_at: string;
  minecraft_version?: string | null;
  difficulty?: string | null;
};

export type BuildsIndexResponse = {
  data: BuildPost[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
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
  version?: string | null;
  minecraft_version?: string | null;
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
  skin_texture_file?: string | null;
};

export type ShowResponse<T> = {
  data: T;
};

export const buildsApi = {
  index: (params?: { 
    page?: number; 
    difficulty?: string;
    search?: string;
  }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.difficulty) q.set("difficulty", params.difficulty);
    if (params?.search) q.set("search", params.search);
    const query = q.toString();
    return apiFetch<BuildsIndexResponse>(`builds${query ? `?${query}` : ""}`);
  },
  show: (id: number) => apiFetch<ShowResponse<BuildPost>>(`builds/${id}`),

  create: (formData: FormData) => {
    const base = getBaseUrl().replace(/\/$/, "");
    const token = typeof window !== "undefined" ? localStorage.getItem("rucraft_token") : null;
    return fetch(`${base}/builds`, {
      method: "POST",
      headers: { Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: formData,
    }).then(async (res) => {
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { message?: string }).message ?? String(res.status));
      return data;
    });
  },
  
  getDifficulties: () => 
    apiFetch<{ data: string[] }>('builds/difficulties'),
};

export const seedsApi = {
  index: () => apiFetch<{ data: SeedPost[] }>("seeds"),
  show: (id: number) => apiFetch<ShowResponse<SeedPost>>(`seeds/${id}`),
  create: (formData: FormData) => {
    const base = getBaseUrl().replace(/\/$/, "");
    const token = typeof window !== "undefined" ? localStorage.getItem("rucraft_token") : null;
    return fetch(`${base}/seeds`, {
      method: "POST",
      headers: { Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: formData,
    }).then(async (res) => {
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { message?: string }).message ?? String(res.status));
      return data as { message: string; data: { id: number; title: string } };
    });
  },
};

export type SkinsIndexResponse = {
  data: SkinPost[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export type ModsIndexResponse = {
  data: ModPost[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

// ЕДИНСТВЕННОЕ ОПРЕДЕЛЕНИЕ modsApi (используем чужое, с параметрами)
export const modsApi = {
  index: (params?: { 
    page?: number; 
    version?: string; 
    minecraft_version?: string;
    search?: string;
    per_page?: number;
  }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.version) q.set("version", params.version);
    if (params?.minecraft_version) q.set("minecraft_version", params.minecraft_version);
    if (params?.search) q.set("search", params.search);
    if (params?.per_page) q.set("per_page", String(params.per_page));
    const query = q.toString();
    return apiFetch<ModsIndexResponse>(`mods${query ? `?${query}` : ""}`);
  },
  show: (id: number) => apiFetch<ShowResponse<ModPost>>(`mods/${id}`),

  create: (formData: FormData) => {
    const base = getBaseUrl().replace(/\/$/, "");
    const token = typeof window !== "undefined" ? localStorage.getItem("rucraft_token") : null;
    return fetch(`${base}/mods`, {
      method: "POST",
      headers: { Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: formData,
    }).then(async (res) => {
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { message?: string }).message ?? String(res.status));
      return data;
    });
  },
  
  getVersions: () => 
    apiFetch<{ data: string[] }>('mods/versions'),
    
  getMinecraftVersions: () => 
    apiFetch<{ data: string[] }>('mods/minecraft-versions'),
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
    console.log('[skinsApi.create] URL:', `${base}/skins`);
    console.log('[skinsApi.create] Token:', token ? 'present' : 'missing');
    console.log('[skinsApi.create] FormData entries:', Array.from(formData.entries()));
    return fetch(`${base}/skins`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        // Не указываем Content-Type - браузер сам установит multipart/form-data с boundary
      },
      body: formData,
    }).then(async (res) => {
      const data = await res.json().catch(() => ({}));
      console.log('[skinsApi.create] Response status:', res.status, res.statusText);
      console.log('[skinsApi.create] Response data:', data);
      if (!res.ok) throw new Error((data as { message?: string }).message ?? String(res.status));
      return data as CreateSkinResponse;
    });
  },
  
  // Метод для отправки на рассмотрение
  submitForReview: async (formData: FormData) => {
    return apiFetch<{ success: boolean; message: string; data?: any }>("skins/submit", {
      method: "POST",
      token: getToken(),
      requiresCsrf: true,
      isFormData: true,
      body: formData,
    });
  },
};

// ——— Moderation: Skins ———

export type ModerationRequest = {
  id: number;
  user_id: number;
  title: string;
  skin_texture_file: string;
  model: "Steve" | "Alex";
  category: string;
  description: string | null;
  status: "pending" | "approved" | "rejected";
  admin_comment: string | null;
  reviewed_by: number | null;
  created_at: string;
  updated_at: string;
  user: { id: number; name: string; login: string };
  reviewer: { id: number; name: string } | null;
};

export type ModerationIndexResponse = {
  data: ModerationRequest[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export const moderationApi = {
  getSkins: (params?: { per_page?: number; page?: number; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.per_page) q.set("per_page", String(params.per_page));
    if (params?.page) q.set("page", String(params.page));
    if (params?.status) q.set("status", params.status);
    const query = q.toString();
    return apiFetch<ModerationIndexResponse>(`admin/skins/moderation${query ? `?${query}` : ""}`, { token: getToken() });
  },
  getSkin: (id: number) =>
    apiFetch<{ data: ModerationRequest }>(`admin/skins/moderation/${id}`, { token: getToken() }),
  approve: (id: number, adminComment?: string) =>
    apiFetch<{ message: string; data: { skin_id: number; moderation_request_id: number } }>(
      `admin/skins/moderation/${id}/approve`,
      {
        method: "POST",
        body: JSON.stringify({ admin_comment: adminComment || null }),
        token: getToken(),
      }
    ),
  reject: (id: number, adminComment: string) =>
    apiFetch<{ message: string; data: { moderation_request_id: number } }>(
      `admin/skins/moderation/${id}/reject`,
      {
        method: "POST",
        body: JSON.stringify({ admin_comment: adminComment }),
        token: getToken(),
      }
    ),
};

// ——— Moderation: Builds ———

export type BuildModerationRequest = {
  id: number;
  user_id: number;
  title: string;
  minecraft_version: string;
  image: string | null;
  build_file: string | null;
  description: string | null;
  difficulty: string;
  materials: { name: string; count: number }[] | null;
  status: "pending" | "approved" | "rejected";
  admin_comment: string | null;
  reviewed_by: number | null;
  created_at: string;
  updated_at: string;
  user: { id: number; name: string; login: string };
  reviewer: { id: number; name: string } | null;
};

export const buildModerationApi = {
  getBuilds: (params?: { per_page?: number; page?: number; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.per_page) q.set("per_page", String(params.per_page));
    if (params?.page) q.set("page", String(params.page));
    if (params?.status) q.set("status", params.status);
    const query = q.toString();
    return apiFetch<{ data: BuildModerationRequest[]; current_page: number; last_page: number; per_page: number; total: number }>(`admin/builds/moderation${query ? `?${query}` : ""}`, { token: getToken() });
  },
  getBuild: (id: number) =>
    apiFetch<{ data: BuildModerationRequest }>(`admin/builds/moderation/${id}`, { token: getToken() }),
  approve: (id: number, adminComment?: string) =>
    apiFetch<{ message: string; data: { build_id: number } }>(
      `admin/builds/moderation/${id}/approve`,
      {
        method: "POST",
        body: JSON.stringify({ admin_comment: adminComment || null }),
        token: getToken(),
      }
    ),
  reject: (id: number, adminComment: string) =>
    apiFetch<{ message: string; data: { moderation_request_id: number } }>(
      `admin/builds/moderation/${id}/reject`,
      {
        method: "POST",
        body: JSON.stringify({ admin_comment: adminComment }),
        token: getToken(),
      }
    ),
};

// ——— Moderation: Mods ———

export type ModModerationRequest = {
  id: number;
  user_id: number;
  title: string;
  description: string;
  image: string | null;
  mod_file: string;
  version: string;
  minecraft_version: string | null;
  status: "pending" | "approved" | "rejected";
  admin_comment: string | null;
  reviewed_by: number | null;
  created_at: string;
  updated_at: string;
  user: { id: number; name: string; login: string };
  reviewer: { id: number; name: string } | null;
};

export const modModerationApi = {
  getMods: (params?: { per_page?: number; page?: number; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.per_page) q.set("per_page", String(params.per_page));
    if (params?.page) q.set("page", String(params.page));
    if (params?.status) q.set("status", params.status);
    const query = q.toString();
    return apiFetch<{ data: ModModerationRequest[]; current_page: number; last_page: number; per_page: number; total: number }>(`admin/mods/moderation${query ? `?${query}` : ""}`, { token: getToken() });
  },
  getMod: (id: number) =>
    apiFetch<{ data: ModModerationRequest }>(`admin/mods/moderation/${id}`, { token: getToken() }),
  approve: (id: number, adminComment?: string) =>
    apiFetch<{ message: string; data: { mod_id: number } }>(
      `admin/mods/moderation/${id}/approve`,
      {
        method: "POST",
        body: JSON.stringify({ admin_comment: adminComment || null }),
        token: getToken(),
      }
    ),
  reject: (id: number, adminComment: string) =>
    apiFetch<{ message: string; data: { moderation_request_id: number } }>(
      `admin/mods/moderation/${id}/reject`,
      {
        method: "POST",
        body: JSON.stringify({ admin_comment: adminComment }),
        token: getToken(),
      }
    ),
};

// ——— Moderation: Seeds ———

export type SeedModerationRequest = {
  id: number;
  user_id: number;
  title: string;
  seed_number: string;
  version: string;
  minecraft_release: string | null;
  coordinates: { x: number; y: number; z: number } | null;
  image: string | null;
  description: string | null;
  status: "pending" | "approved" | "rejected";
  admin_comment: string | null;
  reviewed_by: number | null;
  created_at: string;
  updated_at: string;
  user: { id: number; name: string; login: string };
  reviewer: { id: number; name: string } | null;
};

export const seedModerationApi = {
  getSeeds: (params?: { per_page?: number; page?: number; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.per_page) q.set("per_page", String(params.per_page));
    if (params?.page) q.set("page", String(params.page));
    if (params?.status) q.set("status", params.status);
    const query = q.toString();
    return apiFetch<{ data: SeedModerationRequest[]; current_page: number; last_page: number; per_page: number; total: number }>(`admin/seeds/moderation${query ? `?${query}` : ""}`, { token: getToken() });
  },
  getSeed: (id: number) =>
    apiFetch<{ data: SeedModerationRequest }>(`admin/seeds/moderation/${id}`, { token: getToken() }),
  approve: (id: number, adminComment?: string) =>
    apiFetch<{ message: string; data: { seed_id: number } }>(
      `admin/seeds/moderation/${id}/approve`,
      {
        method: "POST",
        body: JSON.stringify({ admin_comment: adminComment || null }),
        token: getToken(),
      }
    ),
  reject: (id: number, adminComment: string) =>
    apiFetch<{ message: string; data: { moderation_request_id: number } }>(
      `admin/seeds/moderation/${id}/reject`,
      {
        method: "POST",
        body: JSON.stringify({ admin_comment: adminComment }),
        token: getToken(),
      }
    ),
};

// ——— Analytics ———

export type AnalyticsSummary = {
  total_users: number;
  banned_users: number;
  active_users: number;
  total_skins: number;
  total_builds: number;
  total_modes: number;
  total_seeds: number;
};

export type AnalyticsChartItem = {
  name: string;
  value: number;
};

export type AnalyticsMonthItem = {
  month: string;
  count: number;
};

export type AnalyticsResponse = {
  summary: AnalyticsSummary;
  skins_by_category: AnalyticsChartItem[];
  skins_by_status: AnalyticsChartItem[];
  users_by_role: AnalyticsChartItem[];
  new_users_by_month: AnalyticsMonthItem[];
  content_by_type: AnalyticsChartItem[];
};

export const analyticsApi = {
  index: () =>
    apiFetch<AnalyticsResponse>("admin/analytics", { token: getToken() }),
};