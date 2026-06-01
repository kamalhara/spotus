import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme as useNativeWindColorScheme } from "nativewind";
import { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme as useSystemColorScheme } from "react-native";

const THEME_STORAGE_KEY = "@spotus_theme_preference";

const ThemeContext = createContext({
  theme: "system",
  colorScheme: "light",
  isDark: false,
  setTheme: () => {},
});

export function ThemeProvider({ children }) {
  const systemScheme = useSystemColorScheme();
  const { setColorScheme: setNativeWindColorScheme } =
    useNativeWindColorScheme();
  const [theme, setThemeState] = useState("system"); // "light" | "dark" | "system"
  const [isLoaded, setIsLoaded] = useState(false);

  // Resolve the actual color scheme
  const colorScheme =
    theme === "system" ? systemScheme || "light" : theme;
  const isDark = colorScheme === "dark";

  // Sync NativeWind's color scheme whenever our resolved scheme changes
  useEffect(() => {
    setNativeWindColorScheme(colorScheme);
  }, [colorScheme, setNativeWindColorScheme]);

  // Load persisted preference on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (stored === "light" || stored === "dark" || stored === "system") {
          setThemeState(stored);
        }
      } catch (err) {
        console.error("Error loading theme preference:", err);
      } finally {
        setIsLoaded(true);
      }
    };
    loadTheme();
  }, []);

  // Persist theme changes
  const setTheme = async (newTheme) => {
    setThemeState(newTheme);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (err) {
      console.error("Error saving theme preference:", err);
    }
  };

  if (!isLoaded) return null;

  return (
    <ThemeContext.Provider value={{ theme, colorScheme, isDark, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export default ThemeContext;
