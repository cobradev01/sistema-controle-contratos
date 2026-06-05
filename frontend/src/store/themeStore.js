import { create } from 'zustand';
import { persist } from 'zustand/middleware';

function apply(dark) {
  if (dark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export const useThemeStore = create(
  persist(
    (set, get) => ({
      dark: false,
      toggle() {
        const next = !get().dark;
        set({ dark: next });
        apply(next);
      },
      init() {
        apply(get().dark);
      },
    }),
    { name: 'glc-theme' }
  )
);
