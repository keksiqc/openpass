// Base settings types used by components/hooks
export type PasswordSettings = {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  customCharacters: string;
  excludeSimilar: boolean;
  excludeAmbiguous: boolean;
  minNumbers?: number;
  minSymbols?: number;
  requireEachCharacterType?: boolean;
};

export type PassphraseSettings = {
  wordCount: number;
  separator: string;
  includeNumbers: boolean;
  customWords?: string[];
  wordCase: 'lowercase' | 'uppercase' | 'capitalize' | 'mixed';
  insertNumbersRandomly?: boolean;
};

export type FormatSettings = {
  // This is for "Custom" generator
  format: string;
  templates: Array<{ name: string; pattern: string }>;
};

export type PinSettings = {
  // For Pin Generator
  length: number;
};

// Profile-specific settings types (aliases for now, can diverge later if needed)
export interface PasswordProfileSettings extends PasswordSettings {}
export interface PassphraseProfileSettings extends PassphraseSettings {}
export interface FormatProfileSettings extends FormatSettings {} // For "Custom" profiles
export interface PinProfileSettings extends PinSettings {}

// Discriminated Union for Profiles
export type ProfileType = 'password' | 'passphrase' | 'format' | 'pin';

export type BaseProfile = {
  id: string;
  name: string;
  type: ProfileType;
  createdAt: Date;
  lastUsed?: Date;
  isFavorite?: boolean;
};

export interface PasswordProfile extends BaseProfile {
  type: 'password';
  settings: PasswordProfileSettings;
}

export interface PassphraseProfile extends BaseProfile {
  type: 'passphrase';
  settings: PassphraseProfileSettings;
}

export interface FormatProfile extends BaseProfile {
  // Renamed from CustomProfile
  type: 'format';
  settings: FormatProfileSettings;
}

export interface PinProfile extends BaseProfile {
  type: 'pin';
  settings: PinProfileSettings;
}

export type Profile =
  | PasswordProfile
  | PassphraseProfile
  | FormatProfile
  | PinProfile;

// PinSettings defined above with other base settings types

export type PasswordHistory = {
  id: string;
  password: string;
  type: ProfileType | 'format'; // 'format' might still be used in old history data
  createdAt: Date;
  strength: { score: number; label: string };
};

export type PasswordStrength = {
  score: number;
  label: string;
  color: string;
};

export type AppSettings = {
  historyEnabled: boolean;
  encryptionEnabled: boolean;
  encryptionKey: string;
};
