const API_URL = 'http://localhost:5000';

async function requestJson(url, options = {}) {
  const response = await fetch(`${API_URL}${url}`, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

export async function getCsrfToken() {
  const response = await fetch(`${API_URL}/auth/csrf-token`, { credentials: 'include' });
  const data = await response.json().catch(() => ({}));
  return response.ok ? data.csrfToken : '';
}

export async function loginUser(username, password) {
  const token = await getCsrfToken();
  return requestJson('/auth/login', {
    method: 'POST',
    headers: token ? { 'X-CSRF-Token': token } : {},
    body: JSON.stringify({ username, password }),
  });
}

export async function logoutUser() {
  const token = await getCsrfToken();
  return requestJson('/auth/logout', {
    method: 'POST',
    headers: token ? { 'X-CSRF-Token': token } : {},
  });
}

export async function fetchCurrentUser() {
  return requestJson('/auth/me');
}

export async function changePassword(currentPassword, newPassword) {
  const token = await getCsrfToken();
  return requestJson('/auth/change-password', {
    method: 'POST',
    headers: token ? { 'X-CSRF-Token': token } : {},
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}
