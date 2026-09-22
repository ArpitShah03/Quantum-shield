const API_BASE = '/api';

export const api = {
  get: async (endpoint: string) => {
    return request(endpoint, { method: 'GET' });
  },
  post: async (endpoint: string, body: any, isFormData = false) => {
    const options: RequestInit = { method: 'POST' };
    if (isFormData) {
      options.body = body;
    } else {
      options.body = JSON.stringify(body);
      options.headers = { 'Content-Type': 'application/json' };
    }
    return request(endpoint, options);
  },
  postFormUrlEncoded: async (endpoint: string, body: URLSearchParams) => {
    return request(endpoint, {
      method: 'POST',
      body: body,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  },
  put: async (endpoint: string, body: any) => {
    return request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });
  },
  delete: async (endpoint: string) => {
    return request(endpoint, { method: 'DELETE' });
  },
};

async function request(endpoint: string, options: RequestInit) {
  const token = localStorage.getItem('token');
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'API Request Failed');
  }

  if (response.status === 204) {
    return null; // No content
  }

  return response.json();
}
