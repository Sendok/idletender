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

// Upload API (uses FormData, not JSON)
export const uploadApi = {
  uploadFile: async (file: File, token: string) => {
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Upload failed' }))
      throw new Error(error.error || `HTTP ${res.status}`)
    }

    return res.json() as Promise<{ fileUrl: string; fileName: string; fileSize: number; fileType: string }>
  },
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
    apiFetch<{ job: any; proposals?: any[]; messages?: any[] }>(`/jobs/${id}`, token ? { token } : {}),

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

  deal: (jobId: string, agreedBudget: number, token: string) =>
    apiFetch<{ job: any }>(`/jobs/${jobId}/deal`, {
      method: 'POST',
      body: JSON.stringify({ agreedBudget }),
      token,
    }),

  submitForReview: (jobId: string, token: string) =>
    apiFetch<{ job: any }>(`/jobs/${jobId}/review-stage`, {
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

  getReviews: (id: string) =>
    apiFetch<{ reviews: any[]; avgRating: number; totalReviews: number }>(`/users/${id}/reviews`),
}

// Reviews API
export const reviewsApi = {
  create: (data: { jobId: string; rating: number; comment: string }, token: string) =>
    apiFetch<{ review: any }>('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),

  getJobReviews: (jobId: string) =>
    apiFetch<{ reviews: any[] }>(`/reviews/job/${jobId}`),
}

// Chat API
export const chatApi = {
  getMessages: (jobId: string, token: string) =>
    apiFetch<{ messages: any[] }>(`/chat?jobId=${jobId}`, { token }),

  sendMessage: (jobId: string, message: string, token: string) =>
    apiFetch<{ message: any }>('/chat', {
      method: 'POST',
      body: JSON.stringify({ jobId, message }),
      token,
    }),
}

// Payments API
export const paymentsApi = {
  list: (token: string, jobId?: string) =>
    apiFetch<{ payments: any[] }>(`/payments${jobId ? `?jobId=${jobId}` : ''}`, { token }),

  create: (jobId: string, amount: number, token: string) =>
    apiFetch<{ payment: any }>('/payments', {
      method: 'POST',
      body: JSON.stringify({ jobId, amount }),
      token,
    }),
}
