import { useCallback } from 'react';
import { toast } from 'sonner';
import type { PasswordHistory, PasswordSettings } from '../types';
import { getSecureRandom } from '../utils/crypto';
import {
  calculateEntropy,
  calculateStrength,
} from '../utils/password-strength';

export const usePasswordGenerator = () => {
  // Enhanced character sets with better exclusions
  const getCharacterSet = useCallback((settings: PasswordSettings): string => {
    let charset = '';

    if (settings.includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (settings.includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (settings.includeNumbers) charset += '0123456789';
    if (settings.includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    if (settings.customCharacters) charset += settings.customCharacters;

    if (settings.excludeSimilar) {
      charset = charset.replace(/[0O1lI]/g, '');
    }

    if (settings.excludeAmbiguous) {
      charset = charset.replace(/[{}[\]()/\\'"~,;.<>]/g, '');
    }

    return charset;
  }, []);

  const generatePassword = useCallback(
    (
      settings: PasswordSettings,
      onSuccess: (password: string, historyEntry: PasswordHistory) => void,
    ) => {
      try {
        const charset = getCharacterSet(settings);
        if (!charset) {
          toast.error('Please select at least one character type');
          return;
        }

        let password = '';
        let attempts = 0;
        const maxAttempts = 100;

        // Generate password with minimum requirements
        do {
          password = '';
          for (let i = 0; i < settings.length; i++) {
            password += charset[getSecureRandom(charset.length)];
          }
          attempts++;
        } while (
          attempts < maxAttempts &&
          ((settings.minNumbers &&
            (password.match(/\d/g) || []).length < settings.minNumbers) ||
            (settings.minSymbols &&
              (password.match(/[^a-zA-Z0-9]/g) || []).length <
                settings.minSymbols))
        );

        const entropy = calculateEntropy(password, charset);
        const strength = calculateStrength(password);

        // Create history entry
        const historyEntry: PasswordHistory = {
          id: Date.now().toString(),
          password,
          type: 'password',
          createdAt: new Date(),
          strength: { score: strength.score, label: strength.label },
        };

        onSuccess(password, historyEntry);

        toast.success(
          `${strength.label} password generated! (${Math.round(entropy)} bits entropy)`,
        );
      } catch {
        toast.error('Failed to generate password');
      }
    },
    [getCharacterSet],
  );

  return {
    generatePassword,
    getCharacterSet,
  };
};
