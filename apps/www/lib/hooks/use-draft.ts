"use client";

import { useState, useEffect } from "react";

type UseDraftOptions = {
  key: string;
  initialValue?: string;
  storageType?: "localStorage" | "sessionStorage";
  debounceTime?: number;
};

export const useDraft = (options: UseDraftOptions) => {
  const {
    key,
    initialValue = "",
    storageType = "localStorage",
    debounceTime = 1000
  } = options;

  const storageKey = `draft_${key}`;

  const storage = typeof window !== "undefined" 
    ? storageType === "localStorage" 
      ? window.localStorage 
      : window.sessionStorage
    : null;

  const getInitialValue = () => {
    if (typeof window === "undefined") return initialValue;
    
    try {
      const storedValue = storage?.getItem(storageKey);
      return storedValue ? JSON.parse(storedValue) : initialValue;
    } catch (error) {
      console.error("Error parsing stored draft:", error);
      return initialValue;
    }
  };

  const [value, setValue] = useState<string>(getInitialValue);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const id = setTimeout(() => {
      try {
        storage?.setItem(storageKey, JSON.stringify(value));
      } catch (error) {
        console.error("Error saving draft:", error);
      }
    }, debounceTime);

    setTimeoutId(id);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [value, storageKey, storage, debounceTime]);

  const clearDraft = () => {
    setValue(initialValue);
    if (typeof window !== "undefined") {
      try {
        storage?.removeItem(storageKey);
      } catch (error) {
        console.error("Error clearing draft:", error);
      }
    }
  };

  return [value, setValue, clearDraft] as const;
};