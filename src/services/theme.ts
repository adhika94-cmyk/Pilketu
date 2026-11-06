import { ref } from 'vue';

const THEME_STORAGE_KEY = 'eosis_theme';

export type Theme = 'light' | 'dark';

const isDarkMode = ref<boolean>(false);

export function initTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;

  if (savedTheme) {
    isDarkMode.value = savedTheme === 'dark';
  } else {
    // Check system preference
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    isDarkMode.value = prefersDark;
  }

  applyTheme();
}

export function toggleTheme() {
  isDarkMode.value = !isDarkMode.value;
  applyTheme();
  localStorage.setItem(THEME_STORAGE_KEY, isDarkMode.value ? 'dark' : 'light');
}

export function setTheme(theme: Theme) {
  isDarkMode.value = theme === 'dark';
  applyTheme();
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

function applyTheme() {
  const root = document.documentElement;
  if (isDarkMode.value) {
    root.classList.add('dark');
    root.setAttribute('data-bs-theme', 'dark');
  } else {
    root.classList.remove('dark');
    root.setAttribute('data-bs-theme', 'light');
  }
}

export const themeState = {
  isDarkMode,
  initTheme,
  toggleTheme,
  setTheme,
};
