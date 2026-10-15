/**
 * Centralized API Client for CNC-ERP Frontend
 * Built on native fetch with automatic Bearer token injection,
 * standard HTTP methods (GET, POST, PUT, PATCH, DELETE),
 * and normalized error handling.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api';
const TOKEN_KEY = 'cnc_erp_token';

/**
 * Custom API Error class for normalized error responses
 */
export class ApiError extends Error {
  constructor(message, status = 500, data = null, isNetworkError = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.isNetworkError = isNetworkError;
  }
}

/**
 * Retrieve auth token from storage
 */
export const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Persist auth token to storage
 */
export const setToken = (token) => {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

/**
 * Clear auth token
 */
export const clearToken = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Base fetch wrapper with header injection & error normalization
 * @param {string} endpoint - API path (e.g. '/health' or full URL)
 * @param {RequestInit} [options={}] - Fetch configuration options
 */
export async function apiFetch(endpoint, options = {}) {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

  const token = options.token !== undefined ? options.token : getToken();

  const headers = new Headers(options.headers || {});

  // Automatically attach Bearer token if available and not already provided
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Set default Content-Type to JSON if body is not FormData or already set
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  if (!isFormData && !headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  // Prepare config
  const config = {
    ...options,
    headers,
  };

  // Stringify JSON body if object provided and not FormData/String
  if (
    config.body &&
    typeof config.body === 'object' &&
    !isFormData &&
    !(config.body instanceof Blob)
  ) {
    config.body = JSON.stringify(config.body);
  }

  let response;
  try {
    response = await fetch(url, config);
  } catch (err) {
    // Network or DNS error
    throw new ApiError(
      `Network error: Cannot reach ${url} (${err.message})`,
      0,
      null,
      true
    );
  }

  // Parse response body safely
  let responseData = null;
  const contentType = response.headers.get('content-type') || '';

  try {
    if (contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      const text = await response.text();
      responseData = text ? { message: text } : null;
    }
  } catch (parseError) {
    responseData = { message: 'Failed to parse response payload' };
  }

  // Handle HTTP error statuses
  if (!response.ok) {
    const errorMessage =
      responseData?.message ||
      responseData?.error ||
      `Request failed with status ${response.status} (${response.statusText})`;

    throw new ApiError(errorMessage, response.status, responseData);
  }

  return responseData;
}

/**
 * API methods helper object
 */
export const api = {
  get: (endpoint, options = {}) =>
    apiFetch(endpoint, { ...options, method: 'GET' }),

  post: (endpoint, body, options = {}) =>
    apiFetch(endpoint, { ...options, method: 'POST', body }),

  put: (endpoint, body, options = {}) =>
    apiFetch(endpoint, { ...options, method: 'PUT', body }),

  patch: (endpoint, body, options = {}) =>
    apiFetch(endpoint, { ...options, method: 'PATCH', body }),

  delete: (endpoint, options = {}) =>
    apiFetch(endpoint, { ...options, method: 'DELETE' }),

  // Token helpers
  getToken,
  setToken,
  clearToken,
};

export default api;
