
import { useCallback } from 'react';
import { toast } from 'sonner';
import type { FormatSettings, PasswordHistory } from '../types';
import { getSecureRandom } from '../utils/crypto';
import { calculateStrength } from '../utils/password-strength';

export const useFormatGenerator = () => {
  const generateFormatPassword = useCallback((
    settings: FormatSettings,
    onSuccess: (password: string, historyEntry: PasswordHistory) => void
  ) => {
    const format = settings.format;
    let result = '';
    let i = 0;

    try {
      while (i < format.length) {
        if (/\d/.test(format[i])) {
          // Parse number
          let numStr = '';
          while (i < format.length && /\d/.test(format[i])) {
            numStr += format[i];
            i++;
          }
          const count = Number.parseInt(numStr);

          if (i >= format.length) break;

          const type = format[i];
          let charset = '';

          switch (type) {
            case 'u':
              charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
              break;
            case 'l':
              charset = 'abcdefghijklmnopqrstuvwxyz';
              break;
            case 'd':
              charset = '0123456789';
              break;
            case '{': {
              // Parse custom character set
              i++; // skip '{'
              let customSet = '';
              while (i < format.length && format[i] !== '}') {
                customSet += format[i];
                i++;
              }
              charset = customSet;
              break;
            }
            default:
              throw new Error(`Unknown format type: ${type}`);
          }

          // Generate characters
          for (let j = 0; j < count; j++) {
            if (charset) {
              result += charset[getSecureRandom(charset.length)];
            }
          }
        }
        i++;
      }

      const strength = calculateStrength(result);

      // Create history entry
      const historyEntry: PasswordHistory = {
        id: Date.now().toString(),
        password: result,
        type: 'format',
        createdAt: new Date(),
        strength: { score: strength.score, label: strength.label },
      };

      onSuccess(result, historyEntry);
      toast.success(`${strength.label} format password generated!`);
    } catch {
      toast.error(
        'Invalid format. Use: Nu (uppercase), Nl (lowercase), Nd (digits), N{chars} (custom)',
      );
    }
  }, []);

  return {
    generateFormatPassword,
  };
};
