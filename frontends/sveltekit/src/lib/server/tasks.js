import { env } from '$env/dynamic/private';

const DEFAULT_API_BASE_URL = 'http://127.0.0.1:8001/api';

function apiBaseUrl() {
  return env.DJANGO_API_BASE_URL || DEFAULT_API_BASE_URL;
}

async function apiRequest(fetch, path, options = {}) {
  const response = await fetch(`${apiBaseUrl()}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers
    }
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    const error = new Error(payload?.error || 'Django API request failed.');
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

export async function listTasks(fetch, { status = '', q = '' } = {}) {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (q) params.set('q', q);

  const query = params.toString();
  return apiRequest(fetch, `/tasks/${query ? `?${query}` : ''}`);
}

export async function createTask(fetch, data) {
  return apiRequest(fetch, '/tasks/', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function updateTask(fetch, id, data) {
  return apiRequest(fetch, `/tasks/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
}

export async function deleteTask(fetch, id) {
  return apiRequest(fetch, `/tasks/${id}/`, {
    method: 'DELETE'
  });
}
