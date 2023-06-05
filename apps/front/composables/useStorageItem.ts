export function useStorageItem<T>(
  key: string,
  storage: Storage | null = process.client ? localStorage : null,
) {
  return {
    set(value: T) {
      if (!storage) return;
      storage.setItem(key, JSON.stringify(value));
    },
    get(def: T | null = null): T extends null ? T | null : T {
      if (!storage) return def as any;
      const item = storage.getItem(key);
      if (!item) return def as any;
      try {
        return JSON.parse(item);
      } catch (e) {
        return def as any;
      }
    },
    remove() {
      if (!storage) return;
      storage.removeItem(key);
    },
  };
}
