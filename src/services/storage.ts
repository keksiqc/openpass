
import type { PasswordHistory, PasswordProfile } from '../types';

const PROFILES_KEY = 'openpass-profiles';
const HISTORY_KEY = 'openpass-history';

export const loadProfiles = (): PasswordProfile[] => {
  const saved = localStorage.getItem(PROFILES_KEY);
  if (!saved) return [];

  try {
    const parsed = JSON.parse(saved);
    return parsed.map((p: any) => ({
      ...p,
      createdAt: new Date(p.createdAt),
      lastUsed: p.lastUsed ? new Date(p.lastUsed) : undefined,
    }));
  } catch (error) {
    console.error('Failed to parse saved profiles:', error);
    return [];
  }
};

export const saveProfiles = (profiles: PasswordProfile[]): void => {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
};

export const loadHistory = (): PasswordHistory[] => {
  const saved = localStorage.getItem(HISTORY_KEY);
  if (!saved) return [];

  try {
    const parsed = JSON.parse(saved);
    return parsed.map((h: any) => ({
      ...h,
      createdAt: new Date(h.createdAt),
    }));
  } catch (error) {
    console.error('Failed to parse password history:', error);
    return [];
  }
};

export const saveHistory = (history: PasswordHistory[]): void => {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
};
