const STORAGE_KEY = 'responsiveLabState';

type StorageRecord = Record<string, unknown>;

const memoryStorage = new Map<string, unknown>();

const hasChromeStorage = () =>
  typeof chrome !== 'undefined' && Boolean(chrome.storage?.local);

const hasLocalStorage = () => {
  try {
    return typeof window !== 'undefined' && Boolean(window.localStorage);
  } catch {
    return false;
  }
};

export const appStorageKey = STORAGE_KEY;

export const readStoredAppState = async (): Promise<unknown> => {
  if (hasChromeStorage()) {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    return result[STORAGE_KEY];
  }

  if (hasLocalStorage()) {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    return rawValue ? JSON.parse(rawValue) : undefined;
  }

  return memoryStorage.get(STORAGE_KEY);
};

export const writeStoredAppState = async (value: unknown): Promise<void> => {
  if (hasChromeStorage()) {
    await chrome.storage.local.set({ [STORAGE_KEY]: value });
    return;
  }

  if (hasLocalStorage()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    return;
  }

  memoryStorage.set(STORAGE_KEY, value);
};

export const clearStoredAppState = async (): Promise<void> => {
  if (hasChromeStorage()) {
    await chrome.storage.local.remove(STORAGE_KEY);
    return;
  }

  if (hasLocalStorage()) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }

  memoryStorage.delete(STORAGE_KEY);
};

export const makeStorageRecord = (value: unknown): StorageRecord => ({
  [STORAGE_KEY]: value,
});
