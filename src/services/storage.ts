import type { AppSettings, PasswordHistory, Profile } from "../types"; // Changed PasswordProfile to Profile
import { decrypt, encrypt } from "../utils/encryption";

// Internal interfaces for parsed JSON data
type ParsedProfile = {
  id: string;
  name: string;
  type: string;
  settings: unknown;
  createdAt: string;
  lastUsed?: string;
  isFavorite?: boolean;
};

type ParsedHistoryEntry = {
  id: string;
  password: string;
  type: string;
  createdAt: string;
  strength: { score: number; label: string };
};

const PROFILES_KEY = "openpass-profiles";
const HISTORY_KEY = "openpass-history";
const SETTINGS_KEY = "openpass-settings";

// Default settings
const DEFAULT_SETTINGS: AppSettings = {
  historyEnabled: true,
  encryptionEnabled: false,
  encryptionKey: "",
};

let currentSettings: AppSettings = { ...DEFAULT_SETTINGS };

// Settings management
export const loadSettings = (): AppSettings => {
  const saved = localStorage.getItem(SETTINGS_KEY);
  if (!saved) {
    currentSettings = { ...DEFAULT_SETTINGS };
    return currentSettings;
  }

  try {
    currentSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    return currentSettings;
  } catch (_error) {
    currentSettings = { ...DEFAULT_SETTINGS };
    return currentSettings;
  }
};

export const saveSettings = (settings: AppSettings): void => {
  currentSettings = settings;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

// Helper functions for encryption
const encryptData = (data: string): string => {
  if (!(currentSettings.encryptionEnabled && currentSettings.encryptionKey)) {
    return data;
  }
  return encrypt(data, currentSettings.encryptionKey);
};

const decryptData = (data: string): string => {
  if (!(currentSettings.encryptionEnabled && currentSettings.encryptionKey)) {
    return data;
  }
  return decrypt(data, currentSettings.encryptionKey);
};

export const loadProfiles = (): Profile[] => {
  // Changed to Profile[]
  const saved = localStorage.getItem(PROFILES_KEY);
  if (!saved) {
    return [];
  }

  try {
    const decrypted = decryptData(saved);
    const parsed: ParsedProfile[] = JSON.parse(decrypted);
    return parsed.map((p) => ({
      ...p,
      createdAt: new Date(p.createdAt),
      lastUsed: p.lastUsed ? new Date(p.lastUsed) : undefined,
    })) as Profile[];
  } catch (_error) {
    return [];
  }
};

export const saveProfiles = (profiles: Profile[]): void => {
  // Changed to Profile[]
  const data = JSON.stringify(profiles);
  const encrypted = encryptData(data);
  localStorage.setItem(PROFILES_KEY, encrypted);
};

export const loadHistory = (): PasswordHistory[] => {
  if (!currentSettings.historyEnabled) {
    return [];
  }

  const saved = localStorage.getItem(HISTORY_KEY);
  if (!saved) {
    return [];
  }

  try {
    const decrypted = decryptData(saved);
    const parsed: ParsedHistoryEntry[] = JSON.parse(decrypted);
    return parsed.map((h) => ({
      ...h,
      createdAt: new Date(h.createdAt),
    })) as PasswordHistory[];
  } catch (_error) {
    return [];
  }
};

export const saveHistory = (history: PasswordHistory[]): void => {
  if (!currentSettings.historyEnabled) {
    return;
  }

  const data = JSON.stringify(history);
  const encrypted = encryptData(data);
  localStorage.setItem(HISTORY_KEY, encrypted);
};

export const clearAllData = (): void => {
  localStorage.removeItem(PROFILES_KEY);
  localStorage.removeItem(HISTORY_KEY);
  localStorage.removeItem(SETTINGS_KEY);
};
