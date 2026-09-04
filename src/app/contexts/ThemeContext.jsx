import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext({
  theme: "system",
  setTheme: () => null,
  toggleTheme: () => null,
});

export function ThemeProvider({ children, defaultTheme = "system" }) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("skillup-ui-theme") || defaultTheme
  );

  const applyThemeToDOM = useCallback((themeName) => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    if (themeName === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(themeName);
    }
  }, []);

  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme, applyThemeToDOM]);

  const setThemeFn = useCallback((newTheme) => {
    if (!document.startViewTransition) {
      const root = window.document.documentElement;
      root.classList.add("theme-transition");
      localStorage.setItem("skillup-ui-theme", newTheme);
      setTheme(newTheme);
      setTimeout(() => root.classList.remove("theme-transition"), 350);
      return;
    }
    document.startViewTransition(() => {
      localStorage.setItem("skillup-ui-theme", newTheme);
      setTheme(newTheme);
    });
  }, []);

  /**
   * Smooth circular wave theme transition from click point.
   * Leverages document.startViewTransition with cubic-bezier clip-path expansion.
   */
  const toggleTheme = useCallback((e) => {
    const isCurrentlyDark =
      theme === "dark" ||
      (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    const nextTheme = isCurrentlyDark ? "light" : "dark";

    // Fallback if View Transitions API is not supported
    if (!document.startViewTransition) {
      const root = window.document.documentElement;
      root.classList.add("theme-transition");
      localStorage.setItem("skillup-ui-theme", nextTheme);
      setTheme(nextTheme);
      setTimeout(() => root.classList.remove("theme-transition"), 350);
      return;
    }

    // Extract exact click coordinates for circular radial expansion
    const x = e?.clientX ?? window.innerWidth / 2;
    const y = e?.clientY ?? window.innerHeight / 2;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
      localStorage.setItem("skillup-ui-theme", nextTheme);
      setTheme(nextTheme);
      applyThemeToDOM(nextTheme);
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];
      document.documentElement.animate(
        { clipPath: isCurrentlyDark ? [...clipPath].reverse() : clipPath },
        {
          duration: 450,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          pseudoElement: isCurrentlyDark
            ? "::view-transition-old(root)"
            : "::view-transition-new(root)",
        }
      );
    });
  }, [theme, applyThemeToDOM]);

  const value = useMemo(() => ({
    theme,
    setTheme: setThemeFn,
    toggleTheme,
  }), [theme, setThemeFn, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
