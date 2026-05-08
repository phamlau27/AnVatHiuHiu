import { useState, useEffect } from "react";

/**
 * Prevents hydration mismatch when reading from LocalStorage.
 * Components that depend on persisted Zustand state should
 * conditionally render only after mount.
 */
export function useHasMounted(): boolean {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);
  return hasMounted;
}
