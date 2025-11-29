/**
 * Dark Mode Theme System
 * User preference support with system theme detection and persistence
 */

import React from 'react';

export type Theme = 'light' | 'dark' | 'system';

export interface ThemeConfig {
  theme: Theme;
  enableSystemPreference: boolean;
  enablePersistence: boolean;
  storageKey: string;
  classPrefix: string;
  transitionDuration: number;
}

export class ThemeSystem {
  private config: ThemeConfig;
  private currentTheme: Theme;
  private systemTheme: 'light' | 'dark';
  private mediaQuery: MediaQueryList | null = null;
  private listeners: Set<(theme: Theme) => void> = new Set();

  constructor(config: Partial<ThemeConfig> = {}) {
    this.config = {
      theme: 'system',
      enableSystemPreference: true,
      enablePersistence: true,
      storageKey: 'theme-preference',
      classPrefix: 'theme',
      transitionDuration: 300,
      ...config
    };

    this.currentTheme = this.config.theme;
    this.systemTheme = this.detectSystemTheme();
    
    this.initialize();
  }

  // Initialize theme system
  private initialize() {
    // Load saved preference
    if (this.config.enablePersistence) {
      const saved = this.loadTheme();
      if (saved) {
        this.currentTheme = saved;
      }
    }

    // Set up system theme detection
    if (this.config.enableSystemPreference) {
      this.setupSystemThemeDetection();
    }

    // Apply initial theme
    this.applyTheme();

    // Add transition styles
    this.addTransitionStyles();
  }

  // Detect system theme preference
  private detectSystemTheme(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'light';
    
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  // Set up system theme detection
  private setupSystemThemeDetection() {
    if (typeof window === 'undefined') return;

    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      this.systemTheme = e.matches ? 'dark' : 'light';
      if (this.currentTheme === 'system') {
        this.applyTheme();
      }
    };

    // Modern browsers
    if (this.mediaQuery.addEventListener) {
      this.mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      this.mediaQuery.addListener(handleChange);
    }
  }

  // Get effective theme (resolves 'system' to actual theme)
  getEffectiveTheme(): 'light' | 'dark' {
    if (this.currentTheme === 'system') {
      return this.systemTheme;
    }
    return this.currentTheme;
  }

  // Get current theme setting
  getTheme(): Theme {
    return this.currentTheme;
  }

  // Set theme
  setTheme(theme: Theme) {
    if (this.currentTheme === theme) return;

    this.currentTheme = theme;
    this.applyTheme();
    this.saveTheme();
    this.notifyListeners();
  }

  // Toggle between light and dark
  toggle() {
    const effectiveTheme = this.getEffectiveTheme();
    const newTheme: Theme = effectiveTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  // Apply theme to document
  private applyTheme() {
    if (typeof document === 'undefined') return;

    const effectiveTheme = this.getEffectiveTheme();
    const root = document.documentElement;

    // Remove existing theme classes
    root.classList.remove(`${this.config.classPrefix}-light`, `${this.config.classPrefix}-dark`);

    // Add new theme class
    root.classList.add(`${this.config.classPrefix}-${effectiveTheme}`);

    // Set data attribute for CSS targeting
    root.setAttribute('data-theme', effectiveTheme);

    // Update meta theme-color
    this.updateThemeColor(effectiveTheme);

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('themechange', {
      detail: { theme: this.currentTheme, effectiveTheme }
    }));
  }

  // Update theme color meta tag
  private updateThemeColor(theme: 'light' | 'dark') {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const colors = {
        light: '#ffffff',
        dark: '#1a1a1a'
      };
      metaThemeColor.setAttribute('content', colors[theme]);
    }
  }

  // Add transition styles
  private addTransitionStyles() {
    if (typeof document === 'undefined') return;

    const styleId = 'theme-transitions';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      * {
        transition: background-color ${this.config.transitionDuration}ms ease-in-out,
                    color ${this.config.transitionDuration}ms ease-in-out,
                    border-color ${this.config.transitionDuration}ms ease-in-out,
                    box-shadow ${this.config.transitionDuration}ms ease-in-out !important;
      }
    `;
    document.head.appendChild(style);
  }

  // Save theme preference
  private saveTheme() {
    if (!this.config.enablePersistence || typeof localStorage === 'undefined') return;

    try {
      localStorage.setItem(this.config.storageKey, this.currentTheme);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  }

  // Load theme preference
  private loadTheme(): Theme | null {
    if (!this.config.enablePersistence || typeof localStorage === 'undefined') return null;

    try {
      const saved = localStorage.getItem(this.config.storageKey);
      if (saved && ['light', 'dark', 'system'].includes(saved)) {
        return saved as Theme;
      }
    } catch (error) {
      console.warn('Failed to load theme preference:', error);
    }

    return null;
  }

  // Add theme change listener
  addListener(callback: (theme: Theme) => void) {
    this.listeners.add(callback);
  }

  // Remove theme change listener
  removeListener(callback: (theme: Theme) => void) {
    this.listeners.delete(callback);
  }

  // Notify all listeners
  private notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.currentTheme);
      } catch (error) {
        console.error('Theme listener error:', error);
      }
    });
  }

  // Get theme configuration
  getConfig(): ThemeConfig {
    return { ...this.config };
  }

  // Update configuration
  updateConfig(updates: Partial<ThemeConfig>) {
    this.config = { ...this.config, ...updates };
  }

  // Destroy theme system
  destroy() {
    if (this.mediaQuery && this.mediaQuery.removeEventListener) {
      this.mediaQuery.removeEventListener('change', () => {});
    }
    this.listeners.clear();
  }
}

// React hook for theme
export const useTheme = () => {
  const [theme, setTheme] = React.useState<Theme>('system');
  const [effectiveTheme, setEffectiveTheme] = React.useState<'light' | 'dark'>('light');

  React.useEffect(() => {
    const handleThemeChange = (event: CustomEvent) => {
      setTheme(event.detail.theme);
      setEffectiveTheme(event.detail.effectiveTheme);
    };

    window.addEventListener('themechange', handleThemeChange as EventListener);
    
    return () => {
      window.removeEventListener('themechange', handleThemeChange as EventListener);
    };
  }, []);

  return {
    theme,
    effectiveTheme,
    setTheme: (newTheme: Theme) => {
      window.dispatchEvent(new CustomEvent('setTheme', { detail: { theme: newTheme } }));
    },
    toggle: () => {
      window.dispatchEvent(new CustomEvent('toggleTheme'));
    }
  };
};

// Theme toggle component moved to theme-toggle.tsx for proper JSX support
export { ThemeToggle } from './theme-toggle';

// Theme provider component
export const ThemeProvider: React.FC<{
  children: React.ReactNode;
  config?: Partial<ThemeConfig>;
}> = ({ children, config = {} }) => {
  const [themeSystem] = React.useState(() => new ThemeSystem(config));

  React.useEffect(() => {
    // Handle theme change events
    const handleSetTheme = (event: CustomEvent) => {
      themeSystem.setTheme(event.detail.theme);
    };

    const handleToggleTheme = () => {
      themeSystem.toggle();
    };

    window.addEventListener('setTheme', handleSetTheme as EventListener);
    window.addEventListener('toggleTheme', handleToggleTheme);

    return () => {
      window.removeEventListener('setTheme', handleSetTheme as EventListener);
      window.removeEventListener('toggleTheme', handleToggleTheme);
      themeSystem.destroy();
    };
  }, [themeSystem]);

  return <>{children}</>;
};

// Export singleton instance
export const themeSystem = new ThemeSystem();

// Auto-initialize theme system
if (typeof window !== 'undefined') {
  // Theme system is auto-initialized in constructor
}