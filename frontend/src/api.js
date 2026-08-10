// API base URL — relative path works in both dev (Vite proxy) and production
const API_BASE = '/api';

/**
 * Get stored auth token from localStorage
 */
export function getToken() {
  return localStorage.getItem('ucare_token');
}

/**
 * Store auth token and user info
 */
export function setAuth(token, user) {
  localStorage.setItem('ucare_token', token);
  localStorage.setItem('ucare_user', JSON.stringify(user));
}

/**
 * Clear auth data (logout)
 */
export function clearAuth() {
  localStorage.removeItem('ucare_token');
  localStorage.removeItem('ucare_user');
}

/**
 * Get stored user object
 */
export function getUser() {
  const raw = localStorage.getItem('ucare_user');
  return raw ? JSON.parse(raw) : null;
}

/**
 * Make an authenticated API request
 */
export async function apiFetch(path, options = {}) {
  const token = getToken();
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw { status: response.status, data };
  }

  return data;
}

/**
 * POST /api/auth/login
 */
export async function login(email, password) {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

/**
 * POST /api/auth/logout
 */
export async function logout() {
  return apiFetch('/auth/logout', { method: 'POST' });
}
