import { useCallback } from "react";
import { toast } from "sonner";
import { CHARACTER_SETS, GENERATION_LIMITS } from "../constants/generator";
import type { PasswordHistory, PasswordSettings } from "../types";
import { getSecureRandom } from "../utils/crypto";
import {
  calculateEntropy,
  calculateStrength,
} from "../utils/password-strength";

export const usePasswordGenerator = () => {
  // Enhanced character sets with better exclusions
  const getCharacterSet = useCallback((settings: PasswordSettings): string => {
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
        `[${CHARACTER_SETS.AMBIGUOUS.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}]`,
        "g"
      );
      charset = charset.replace(ambiguousRegex, "");
    }

    return charset;
  }, []);

  const generatePassword = useCallback(
    (
      settings: PasswordSettings,
      onSuccess: (password: string, historyEntry: PasswordHistory) => void
    ) => {
      try {
        const charset = getCharacterSet(settings);
        if (!charset) {
          toast.error("Please select at least one character type");
          return;
        }

        let password = "";
        const maxAttempts = GENERATION_LIMITS.MAX_ATTEMPTS; // General attempts for basic generation
        let meetsCriteria = false;
        const maxRetryForEnforcement =
          GENERATION_LIMITS.MAX_ENFORCEMENT_RETRIES; // Retries for character type enforcement
        let enforcementRetries = 0;

        do {
          // Inner loop for basic generation with minNumbers and minSymbols
          let generationAttempts = 0;
          do {
            password = "";
            for (let i = 0; i < settings.length; i++) {
              password += charset[getSecureRandom(charset.length)];
            }
            generationAttempts++;
          } while (
            generationAttempts < maxAttempts &&
            ((settings.minNumbers &&
              (password.match(/\d/g) || []).length <
                (settings.minNumbers || 0)) ||
              (settings.minSymbols &&
                (
                  password.match(
                    new RegExp(
                      `[${settings.includeSymbols ? "!@#$%^&*()_+-=[]{}|;:,.<>?" : ""}${settings.customCharacters?.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}]`,
                      "g"
                    )
                  ) || []
                ).length < (settings.minSymbols || 0)))
          );

          if (settings.requireEachCharacterType) {
            meetsCriteria = true;
            if (settings.includeUppercase && !/[A-Z]/.test(password)) {
              meetsCriteria = false;
            }
            if (settings.includeLowercase && !/[a-z]/.test(password)) {
              meetsCriteria = false;
            }
            if (settings.includeNumbers && !/\d/.test(password)) {
              meetsCriteria = false;
            }
            // Check for symbols from the actual symbol set used
            const symbolCharset =
              `${settings.includeSymbols ? "!@#$%^&*()_+-=[]{}|;:,.<>?" : ""}${settings.customCharacters || ""}`.replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
              );
            if (
              settings.includeSymbols &&
              !new RegExp(`[${symbolCharset}]`).test(password) &&
              symbolCharset.length > 0
            ) {
              meetsCriteria = false;
            }

            enforcementRetries++;
            if (meetsCriteria) {
              break; // Exit if criteria met
            }
          } else {
            meetsCriteria = true; // Skip enforcement if not required
            break;
          }
        } while (enforcementRetries < maxRetryForEnforcement);

        if (settings.requireEachCharacterType && !meetsCriteria) {
          toast.warning(
            "Could not enforce all character types. Try increasing length or reducing restrictions.",
            { duration: 5000 }
          );
          // Proceed with the last generated password even if not all types are enforced
        }

        const entropy = calculateEntropy(password, charset);
        const strength = calculateStrength(password);

        // Create history entry
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
    [getCharacterSet]
  );

  return {
    generatePassword,
    getCharacterSet,
  };
};
