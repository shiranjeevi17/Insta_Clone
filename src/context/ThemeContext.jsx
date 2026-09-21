import { createContext, useState, useEffect } from 'react';
import { getStorage, setStorage, STORAGE_KEYS, initializeStorage } from '../utils/storage';

export const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [storageReady, setStorageReady] = useState(false);
  const [theme, setTheme] = useState(() => {
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  });

  useEffect(() => {
    const loadTheme = async () => {
      try {
        await initializeStorage();
        const stored = getStorage(STORAGE_KEYS.THEME, null);
        if (stored) setTheme(stored);
        setStorageReady(true);
      } catch (err) {
        console.error('Failed to load theme', err);
      }
    };

    loadTheme();
  }, []);

  // Apply theme to document + persist through the shared storage utility
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (storageReady) setStorage(STORAGE_KEYS.THEME, theme);
  }, [theme, storageReady]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const value = {
    theme,
    toggleTheme,
    isDark: theme === 'dark'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
