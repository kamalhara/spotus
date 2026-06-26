import { createContext, useCallback, useContext, useState } from "react";

const FloatingButtonContext = createContext(null);

/**
 * Provider that lets individual tab screens override the shared floating
 * glass button's icon, tintColor, onPress, and iconColor.
 *
 * Wrap around the tab navigator in _layout.jsx.
 */
export function FloatingButtonProvider({ children }) {
  const [override, setOverride] = useState(null);

  const setFloatingButtonOverride = useCallback((config) => {
    setOverride(config);
  }, []);

  const clearFloatingButtonOverride = useCallback(() => {
    setOverride(null);
  }, []);

  return (
    <FloatingButtonContext.Provider
      value={{ override, setFloatingButtonOverride, clearFloatingButtonOverride }}
    >
      {children}
    </FloatingButtonContext.Provider>
  );
}

/**
 * Hook for tab screens to override the floating button config.
 *
 * Usage:
 *   const { setFloatingButtonOverride, clearFloatingButtonOverride } = useFloatingButton();
 *
 *   useFocusEffect(useCallback(() => {
 *     setFloatingButtonOverride({ icon: "add", tintColor: "#FF6B47", onPress: handleCreate });
 *     return () => clearFloatingButtonOverride();
 *   }, []));
 */
export function useFloatingButton() {
  const ctx = useContext(FloatingButtonContext);
  if (!ctx) {
    throw new Error("useFloatingButton must be used within FloatingButtonProvider");
  }
  return ctx;
}
