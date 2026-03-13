// Base settings types used by components/hooks
export interface PasswordSettings {
  customCharacters: string;
  excludeAmbiguous: boolean;
  excludeSimilar: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  includeUppercase: boolean;
  length: number;
  minNumbers?: number;
  minSymbols?: number;
  requireEachCharacterType?: boolean;
}

export interface PassphraseSettings {
  customWords?: string[];
  includeNumbers: boolean;
  insertNumbersRandomly?: boolean;
  separator: string;
  wordCase: "lowercase" | "uppercase" | "capitalize" | "mixed";
  wordCount: number;
}

export type ReadableStrength = "easy" | "moderate" | "strong" | "ultra";
export type FormatMode = "custom" | "readable";

export interface ReadablePreset {
  description: string;
  label: string;
  pattern: string;
  strength: ReadableStrength;
}

export interface FormatSettings {
  format: string;
  mode: FormatMode;
  readableStrength: ReadableStrength;
  templates: Array<{ name: string; pattern: string }>;
}

export interface PinSettings {
  // For Pin Generator
  length: number;
}

// Profile-specific settings types (aliases for now, can diverge later if needed)
export interface PasswordProfileSettings extends PasswordSettings {}
export interface PassphraseProfileSettings extends PassphraseSettings {}
export interface FormatProfileSettings extends FormatSettings {} // For "Custom" profiles
export interface PinProfileSettings extends PinSettings {}

// Discriminated Union for Profiles
export type ProfileType = "password" | "passphrase" | "format" | "pin";

export interface BaseProfile {
  createdAt: Date;
  id: string;
  isFavorite?: boolean;
  lastUsed?: Date;
  name: string;
  type: ProfileType;
}

export interface PasswordProfile extends BaseProfile {
  settings: PasswordProfileSettings;
  type: "password";
}

export interface PassphraseProfile extends BaseProfile {
  settings: PassphraseProfileSettings;
  type: "passphrase";
}

export interface FormatProfile extends BaseProfile {
  settings: FormatProfileSettings;
  // Renamed from CustomProfile
  type: "format";
}

export interface PinProfile extends BaseProfile {
  settings: PinProfileSettings;
  type: "pin";
}

export type Profile =
  | PasswordProfile
  | PassphraseProfile
  | FormatProfile
  | PinProfile;

// PinSettings defined above with other base settings types

export interface PasswordHistory {
  createdAt: Date;
  id: string;
  password: string;
  strength: { score: number; label: string };
  type: ProfileType | "format"; // 'format' might still be used in old history data
}

export interface PasswordStrength {
  color: string;
  label: string;
  score: number;
}

export interface AppSettings {
  encryptionEnabled: boolean;
  encryptionKey: string;
  historyEnabled: boolean;
}
