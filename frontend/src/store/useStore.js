import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set, get) => ({
      // ── Auth State ──────────────────────────────
      user: null,
      token: null,
      isAuthenticated: false,

      // ── Theme State ─────────────────────────────
      theme: 'light',

      // ── UI State ────────────────────────────────
      sidebarOpen: true,
      loading: false,

      // ── Auth Actions ────────────────────────────
      setUser: (user) => set({ user, isAuthenticated: true }),
      setToken: (token) => set({ token }),
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),

      // ── Theme Actions ───────────────────────────
      toggleTheme: () => {
        const next = get().theme === 'light' ? 'dark' : 'light';
        document.documentElement.classList.toggle('dark', next === 'dark');
        set({ theme: next });
      },
      setTheme: (theme) => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        set({ theme });
      },

      // ── UI Actions ──────────────────────────────
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setLoading: (loading) => set({ loading }),
    }),
    {
      name: 'study-planner-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        theme: state.theme,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.theme === 'dark') {
          document.documentElement.classList.add('dark');
        }
      },
    }
  )
);
