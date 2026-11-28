'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  setMode: () => {},
  toggleMode: () => {},
});

function getInitialMode(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  try {
    const saved = localStorage.getItem('theme-mode');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function applyThemeToDOM(newMode: ThemeMode) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (newMode === 'dark') {
    root.dataset.mode = 'dark';
  } else {
    delete root.dataset.mode;
  }
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) {
    themeMeta.setAttribute('content', newMode === 'dark' ? '#1A1818' : '#E8E4E0');
  }
  try {
    localStorage.setItem('theme-mode', newMode);
  } catch {}
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(getInitialMode);

  useEffect(() => {
    applyThemeToDOM(mode);
  }, [mode]);

  const transitionTo = (newMode: ThemeMode) => {
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (document as any).startViewTransition(() => {
        applyThemeToDOM(newMode);
        setModeState(newMode);
      });
    } else {
      applyThemeToDOM(newMode);
      setModeState(newMode);
    }
  };

  const setMode = (newMode: ThemeMode) => {
    transitionTo(newMode);
  };

  const toggleMode = () => {
    transitionTo(mode === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ mode, setMode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
