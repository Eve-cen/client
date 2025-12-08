// client/src/utils/api.js
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
const cache = new Map(); // In-memory cache

const apiFetch = async ({
  endpoint,
  method = "GET",
  body = null,
  cacheable = false, // Enable caching for GET requests
  timeout = 10000, // 10 seconds timeout
  headers = {},
}) => {
  // const baseURL = "http://localhost:5000/api"; // Replace with env variable in production
  const baseURL = "https://evencen.onrender.com/api"; // Replace with env variable in production
  const url = `${baseURL}${endpoint}`;
  const token = localStorage.getItem("token");

  // Cache key for GET requests
  const cacheKey = cacheable ? `${method}:${url}` : null;

  // Check cache for GET requests
  if (cacheable && method === "GET" && cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (Date.now() < cached.expires) {
      return cached.data; // Return cached data if not expired
    } else {
      cache.delete(cacheKey); // Clear expired cache
    }
  }

  // Build headers
  const defaultHeaders = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...headers,
  };

  // Build fetch options
  const options = {
    method,
    headers: defaultHeaders,
    ...(body && { body: JSON.stringify(body) }),
  };

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP error! Status: ${response.status}`
      );
    }

    const data = await response.json();

    // Cache GET responses if cacheable
    if (cacheable && method === "GET") {
      cache.set(cacheKey, {
        data,
        expires: Date.now() + CACHE_TTL,
      });
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      throw new Error("Request timed out");
    }
    throw err; // Rethrow other errors
  }
};

// Invalidate cache for specific endpoints (e.g., after POST/PUT/DELETE)
const invalidateCache = (endpoint) => {
  for (const key of cache.keys()) {
    if (key.includes(endpoint)) {
      cache.delete(key);
    }
  }
};

export { apiFetch, invalidateCache };
