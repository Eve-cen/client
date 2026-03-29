import { toast } from "react-toastify";

const CACHE_TTL = 5 * 60 * 1000;
const cache = new Map();

export const invalidateCache = (endpoint) => {
  for (const key of cache.keys()) {
    if (key.includes(endpoint)) cache.delete(key);
  }
};

// Attempt silent token refresh
const tryRefreshToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return null;
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) throw new Error("Refresh failed");
    const data = await res.json();
    localStorage.setItem("token", data.token);
    return data.token;
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    return null;
  }
};

const apiFetch = async ({
  endpoint,
  method = "GET",
  body = null,
  cacheable = false,
  timeout = 15000,
  headers = {},
  showErrorToast = true,
}) => {
  const baseURL = import.meta.env.VITE_API_URL;
  const url = `${baseURL}${endpoint}`;
  let token = localStorage.getItem("token");

  const cacheKey = cacheable ? `${method}:${url}` : null;

  if (cacheable && method === "GET" && cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (Date.now() < cached.expires) return cached.data;
    cache.delete(cacheKey);
  }

  const buildOptions = (tok) => ({
    method,
    headers: {
      ...(!(body instanceof FormData) && { "Content-Type": "application/json" }),
      ...(tok && { Authorization: `Bearer ${tok}` }),
      ...headers,
    },
    ...(body && { body: body instanceof FormData ? body : JSON.stringify(body) }),
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    let response = await fetch(url, { ...buildOptions(token), signal: controller.signal });
    clearTimeout(timeoutId);

    // Auto-refresh on 401
    if (response.status === 401 && token) {
      const newToken = await tryRefreshToken();
      if (newToken) {
        response = await fetch(url, buildOptions(newToken));
      } else {
        // Force logout
        window.dispatchEvent(new Event("auth:logout"));
        throw new Error("Session expired. Please log in again.");
      }
    }

    if (response.status === 204) return null;

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.error || `Request failed (${response.status})`;
      if (showErrorToast) toast.error(message);
      throw new Error(message);
    }

    const data = await response.json();

    if (cacheable && method === "GET") {
      cache.set(cacheKey, { data, expires: Date.now() + CACHE_TTL });
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") throw new Error("Request timed out. Please try again.");
    throw err;
  }
};

export { apiFetch };
