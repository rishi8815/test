import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeType = 'user' | 'partner' | 'merchant';

type ThemeContextValue = {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeType>('user');

  useEffect(() => {
    const root = document.documentElement;
    let primaryColor = 'var(--pink)';
    let primaryDarkColor = 'var(--pink-dark)';

    switch (theme) {
      case 'partner':
        primaryColor = 'var(--teal)';
        // Simple darkening for teal #54D9C9 -> #3DB9A9 approx
        primaryDarkColor = '#3DB9A9'; 
        break;
      case 'merchant':
        primaryColor = 'var(--purple)';
        // Simple darkening for purple #5030E2 -> #3A20B0 approx
        primaryDarkColor = '#3A20B0';
        break;
      case 'user':
      default:
        primaryColor = 'var(--pink)';
        primaryDarkColor = 'var(--pink-dark)';
        break;
    }

    root.style.setProperty('--primary', primaryColor);
    root.style.setProperty('--primary-dark', primaryDarkColor);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
