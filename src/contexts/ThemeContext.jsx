import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    // We only check localStorage on client-side mount
    // The default will be 'light' until the client hydrates.
    return 'light';
  });

  useEffect(() => {
    // This effect runs only on the client, after initial render
    const storedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Logic: Use stored theme if it exists. Otherwise, for first-time visitors,
    // we enforce 'light' mode, ignoring system preference.
    // A user must explicitly switch to dark mode.
    const initialTheme = storedTheme || 'light';
    
    setThemeState(initialTheme);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    // Don't save 'system' to localStorage, only explicit user choices.
    if (theme === 'light' || theme === 'dark') {
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme);
  }, []);

  const value = {
    theme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};