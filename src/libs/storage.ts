const isClient = typeof window !== 'undefined';

export const Storage = {
  Local: {
    get: <T>(key: string): T | null => {
      if (!isClient) return null;
      const item = localStorage.getItem(key);
      if (!item) return null;
      try {
        return JSON.parse(item) as T;
      } catch {
        return null;
      }
    },
    set: <T>(key: string, value: T): void => {
      if (!isClient) return;
      localStorage.setItem(key, JSON.stringify(value));
    },
    remove: (key: string): void => {
      if (!isClient) return;
      localStorage.removeItem(key);
    },
  },
  Session: {
    get: <T>(key: string): T | null => {
      if (!isClient) return null;
      const item = sessionStorage.getItem(key);
      if (!item) return null;
      try {
        return JSON.parse(item) as T;
      } catch {
        return null;
      }
    },
    set: <T>(key: string, value: T): void => {
      if (!isClient) return;
      sessionStorage.setItem(key, JSON.stringify(value));
    },
    remove: (key: string): void => {
      if (!isClient) return;
      sessionStorage.removeItem(key);
    },
  },
};
