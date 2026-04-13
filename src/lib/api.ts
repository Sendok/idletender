const API_BASE = '/api'

interface FetchOptions extends RequestInit {
  token?: string
}

async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...fetchOptions,
    headers,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Network error' }))
    throw new Error(error.error || `HTTP ${res.status}`)
  }

  return res.json()
}

// Auth API
export const authApi = {
  register: (data: { name: string; email: string; password: string; role: string }) =>
    apiFetch<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    apiFetch<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  me: (token: string) =>
    apiFetch<{ user: any }>('/auth/me', { token }),
}

// Jobs API
export const jobsApi = {
  list: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return apiFetch<{ jobs: any[]; total: number; page: number; totalPages: number }>(`/jobs${query}`)
  },

  get: (id: string, token?: string) =>
    apiFetch<{ job: any; proposals?: any[] }>(`/jobs/${id}`, token ? { token } : {}),

  create: (data: any, token: string) =>
    apiFetch<{ job: any }>('/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),

  update: (id: string, data: any, token: string) =>
    apiFetch<{ job: any }>(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      token,
    }),

  delete: (id: string, token: string) =>
    apiFetch<{ success: boolean }>(`/jobs/${id}`, {
      method: 'DELETE',
      token,
    }),

  getProposals: (jobId: string, token: string) =>
    apiFetch<{ proposals: any[] }>(`/jobs/${jobId}/proposals`, { token }),

  selectWorker: (jobId: string, workerId: string, token: string) =>
    apiFetch<{ job: any }>(`/jobs/${jobId}/select-worker`, {
      method: 'POST',
      body: JSON.stringify({ workerId }),
      token,
    }),

  start: (jobId: string, token: string) =>
    apiFetch<{ job: any }>(`/jobs/${jobId}/start`, {
      method: 'POST',
      token,
    }),

  complete: (jobId: string, token: string) =>
    apiFetch<{ job: any }>(`/jobs/${jobId}/complete`, {
      method: 'POST',
      token,
    }),
}

// Proposals API
export const proposalsApi = {
  create: (data: any, token: string) =>
    apiFetch<{ proposal: any }>('/proposals', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),

  getMyProposals: (token: string, status?: string) =>
    apiFetch<{ proposals: any[] }>(`/my-proposals${status ? `?status=${status}` : ''}`, { token }),

  updateStatus: (proposalId: string, status: string, token: string) =>
    apiFetch<{ proposal: any }>(`/proposals/${proposalId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
      token,
    }),
}

// Notifications API
export const notificationsApi = {
  list: (token: string, unreadOnly?: boolean) =>
    apiFetch<{ notifications: any[]; unreadCount: number }>(
      `/notifications${unreadOnly ? '?unread=true' : ''}`,
      { token }
    ),

  markRead: (id: string, token: string) =>
    apiFetch<{ notification: any }>(`/notifications/${id}/read`, {
      method: 'PUT',
      token,
    }),

  markAllRead: (token: string) =>
    apiFetch<{ success: boolean }>('/notifications/read-all', {
      method: 'PUT',
      token,
    }),
}

// Dashboard API
export const dashboardApi = {
  worker: (token: string) =>
    apiFetch<any>('/dashboard/worker', { token }),

  provider: (token: string) =>
    apiFetch<any>('/dashboard/provider', { token }),
}

// Users API
export const usersApi = {
  get: (id: string) =>
    apiFetch<{ user: any }>(`/users/${id}`),

  updateProfile: (data: any, token: string) =>
    apiFetch<{ user: any }>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
      token,
    }),
}
