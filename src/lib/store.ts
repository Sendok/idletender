import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  name: string
  email: string
  role: 'WORKER' | 'JOB_PROVIDER'
  avatarUrl: string | null
  bio: string | null
  skills: string | null
  location: string | null
  createdAt: string
  updatedAt: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: 'tender-hub-auth',
    }
  )
)

type Page =
  | 'home'
  | 'browse-jobs'
  | 'job-detail'
  | 'login'
  | 'register'
  | 'worker-dashboard'
  | 'worker-proposals'
  | 'worker-jobs'
  | 'worker-profile'
  | 'provider-dashboard'
  | 'provider-create-job'
  | 'provider-jobs'
  | 'provider-job-proposals'
  | 'provider-notifications'
  | 'worker-notifications'
  | 'provider-profile'

interface RouterState {
  currentPage: Page
  params: Record<string, string>
  navigate: (page: Page, params?: Record<string, string>) => void
}

export const useRouterStore = create<RouterState>()((set) => ({
  currentPage: 'home',
  params: {},
  navigate: (page, params = {}) => set({ currentPage: page, params }),
}))
