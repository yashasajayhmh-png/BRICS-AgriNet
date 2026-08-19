/**
 * Authenticated Fetch & API Client for BRICS AgriNet
 * Automatically injects JWT Bearer tokens from localStorage or active farmer profile
 */

const TOKEN_STORAGE_KEY = 'agrinet_jwt_token';
const FARMER_STORAGE_KEY = 'agrinet_active_farmer';

export function getStoredAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredAuthToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch (err) {
    console.warn('Failed to store auth token:', err);
  }
}

export function removeStoredAuthToken(): void {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to remove auth token:', err);
  }
}

/**
 * Ensure an authentication token exists (creating a demo session token if needed)
 */
export async function ensureAuthToken(): Promise<string> {
  const existing = getStoredAuthToken();
  if (existing) {
    return existing;
  }

  // Fetch a valid demo token from server for the active farmer or default demo
  try {
    let farmerId = 'farmer-01';
    const savedFarmer = localStorage.getItem(FARMER_STORAGE_KEY);
    if (savedFarmer) {
      const parsed = JSON.parse(savedFarmer);
      if (parsed?.id) farmerId = parsed.id;
    }

    const res = await fetch('/api/auth/demo-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ farmerId }),
    });
    const json = await res.json();
    if (json.success && json.token) {
      setStoredAuthToken(json.token);
      return json.token;
    }
  } catch (err) {
    console.warn('Failed to obtain bootstrap demo token:', err);
  }

  return '';
}

/**
 * Wrapper around standard fetch that automatically attaches JWT Authorization header
 */
export async function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers || {});
  
  let token = getStoredAuthToken();
  if (!token) {
    token = await ensureAuthToken();
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(input, {
    ...init,
    headers,
  });

  // If token expired (401), try renewing once via demo-token
  if (response.status === 401 && !input.toString().includes('/api/auth/')) {
    removeStoredAuthToken();
    const freshToken = await ensureAuthToken();
    if (freshToken) {
      headers.set('Authorization', `Bearer ${freshToken}`);
      return fetch(input, {
        ...init,
        headers,
      });
    }
  }

  return response;
}
