const API_BASE = '/api';

async function request(url, options = {}) {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// Parts API
export const partsApi = {
  getAll: (category) => request(category ? `/parts?category=${category}` : '/parts'),
  getById: (id) => request(`/parts/${id}`),
  create: (data) => request('/parts', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/parts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/parts/${id}`, { method: 'DELETE' }),
  getHistory: (id) => request(`/parts/${id}/history`),
};

// Configurations API
export const configurationsApi = {
  getAll: () => request('/configurations'),
  getById: (id) => request(`/configurations/${id}`),
  create: (data) => request('/configurations', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/configurations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/configurations/${id}`, { method: 'DELETE' }),
};
