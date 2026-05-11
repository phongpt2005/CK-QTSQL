import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  language: 'vi' | 'en';
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (lang: 'vi' | 'en') => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      theme: 'light',
      language: 'vi',
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      setTheme: (theme) => {
        set({ theme });
        if (theme === 'dark') {
          document.body.classList.add('dark-theme');
        } else {
          document.body.classList.remove('dark-theme');
        }
      },
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'wms-ui-storage',
    }
  )
);
