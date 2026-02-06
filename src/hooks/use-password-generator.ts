import { useCallback } from "react";
import { toast } from "sonner";
import { CHARACTER_SETS, GENERATION_LIMITS } from "../constants/generator";
import type { PasswordHistory, PasswordSettings } from "../types";
import { getSecureRandom } from "../utils/crypto";
import {
  calculateEntropy,
  calculateStrength,
} from "../utils/password-strength";

const UPPERCASE_REGEX = /[A-Z]/;
const LOWERCASE_REGEX = /[a-z]/;
const DIGIT_REGEX = /\d/;
const ESCAPE_REGEX = /[.*+?^${}()|[\]\\]/g;

function buildCharacterSet(settings: PasswordSettings): string {
  let charset = "";

  if (settings.includeUppercase) {
    charset += CHARACTER_SETS.UPPERCASE;
  }
  if (settings.includeLowercase) {
    charset += CHARACTER_SETS.LOWERCASE;
  }
  if (settings.includeNumbers) {
    charset += CHARACTER_SETS.NUMBERS;
  }
  if (settings.includeSymbols) {
    charset += CHARACTER_SETS.SYMBOLS;
  }
  if (settings.customCharacters) {
    charset += settings.customCharacters;
  }

  if (settings.excludeSimilar) {
    const similarRegex = new RegExp(`[${CHARACTER_SETS.SIMILAR}]`, "g");
    charset = charset.replace(similarRegex, "");
  }

  if (settings.excludeAmbiguous) {
    const ambiguousRegex = new RegExp(
      `[${CHARACTER_SETS.AMBIGUOUS.replace(ESCAPE_REGEX, "\\$&")}]`,
      "g"
    );
    charset = charset.replace(ambiguousRegex, "");
  }

  return charset;
}

function generateRandomString(length: number, charset: string): string {
  let result = "";
  for (const _ of Array.from({ length })) {
    result += charset[getSecureRandom(charset.length)];
  }
  return result;
}

function buildSymbolCharset(settings: PasswordSettings): string {
  const raw = `${settings.includeSymbols ? "!@#$%^&*()_+-=[]{}|;:,.<>?" : ""}${settings.customCharacters || ""}`;
  return raw.replace(ESCAPE_REGEX, "\\$&");
}

function meetsMinimumCounts(
  password: string,
  settings: PasswordSettings
): boolean {
  if (settings.minNumbers) {
    const digitCount = (password.match(/\d/g) || []).length;
    if (digitCount < (settings.minNumbers || 0)) {
      return false;
    }
  }
  if (settings.minSymbols) {
    const symbolCharset = buildSymbolCharset(settings);
    const symbolRegex = new RegExp(
      `[${settings.includeSymbols ? "!@#$%^&*()_+-=[]{}|;:,.<>?" : ""}${settings.customCharacters?.replace(ESCAPE_REGEX, "\\$&") || ""}]`,
      "g"
    );
    const symbolCount = (password.match(symbolRegex) || []).length;
    if (symbolCount < (settings.minSymbols || 0) && symbolCharset.length > 0) {
      return false;
    }
  }
  return true;
}

function meetsCharacterTypeRequirements(
  password: string,
  settings: PasswordSettings
): boolean {
  if (settings.includeUppercase && !UPPERCASE_REGEX.test(password)) {
    return false;
  }
  if (settings.includeLowercase && !LOWERCASE_REGEX.test(password)) {
    return false;
  }
  if (settings.includeNumbers && !DIGIT_REGEX.test(password)) {
    return false;
  }
  const symbolCharset = buildSymbolCharset(settings);
  if (
    settings.includeSymbols &&
    symbolCharset.length > 0 &&
    !new RegExp(`[${symbolCharset}]`).test(password)
  ) {
    return false;
  }
  return true;
}

export const usePasswordGenerator = () => {
  const getCharacterSet = useCallback(buildCharacterSet, []);

  const generatePassword = useCallback(
    (
      settings: PasswordSettings,
      onSuccess: (password: string, historyEntry: PasswordHistory) => void
    ) => {
      try {
        const charset = buildCharacterSet(settings);
        if (!charset) {
          toast.error("Please select at least one character type");
          return;
        }

        let password = "";
        const maxAttempts = GENERATION_LIMITS.MAX_ATTEMPTS;
        let meetsCriteria = false;
        const maxRetryForEnforcement =
          GENERATION_LIMITS.MAX_ENFORCEMENT_RETRIES;
        let enforcementRetries = 0;

        do {
          let generationAttempts = 0;
          do {
            password = generateRandomString(settings.length, charset);
            generationAttempts++;
          } while (
            generationAttempts < maxAttempts &&
            !meetsMinimumCounts(password, settings)
          );

          if (settings.requireEachCharacterType) {
            meetsCriteria = meetsCharacterTypeRequirements(password, settings);
            enforcementRetries++;
            if (meetsCriteria) {
              break;
            }
          } else {
            meetsCriteria = true;
            break;
          }
        } while (enforcementRetries < maxRetryForEnforcement);

        if (settings.requireEachCharacterType && !meetsCriteria) {
          toast.warning(
            "Could not enforce all character types. Try increasing length or reducing restrictions.",
            { duration: 5000 }
          );
        }

        const entropy = calculateEntropy(password, charset);
        const strength = calculateStrength(password);

        const historyEntry: PasswordHistory = {
          id: Date.now().toString(),
          password,
          type: "password",
          createdAt: new Date(),
          strength: { score: strength.score, label: strength.label },
        };

        onSuccess(password, historyEntry);

        toast.success(
          `${strength.label} password generated! (${Math.round(entropy)} bits entropy)`
        );
      } catch {
        toast.error("Failed to generate password");
      }
    },
    []
  );

  return {
    generatePassword,
    getCharacterSet,
  };
};
