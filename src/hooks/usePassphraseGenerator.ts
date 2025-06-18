import { useCallback } from 'react';
import { toast } from 'sonner';
import type { PassphraseSettings, PasswordHistory } from '../types';
import { getSecureRandom } from '../utils/crypto';
import { calculateStrength } from '../utils/password-strength';
import { COMMON_WORDS } from '../utils/words';

export const usePassphraseGenerator = () => {
  const generatePassphrase = useCallback(
    (
      settings: PassphraseSettings,
      onSuccess: (passphrase: string, historyEntry: PasswordHistory) => void,
    ) => {
      try {
        const wordSource =
          settings.customWords && settings.customWords.length > 0
            ? settings.customWords
            : COMMON_WORDS;

        const words = [];
        for (let i = 0; i < settings.wordCount; i++) {
          let word = wordSource[getSecureRandom(wordSource.length)];

          switch (settings.wordCase) {
            case 'uppercase':
              word = word.toUpperCase();
              break;
            case 'capitalize':
              word = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
              break;
            case 'mixed':
              word =
                Math.random() > 0.5 ? word.toUpperCase() : word.toLowerCase();
              break;
            default:
              word = word.toLowerCase();
          }

          words.push(word);
        }

        let passphrase = '';

        if (settings.includeNumbers && settings.insertNumbersRandomly) {
          const numberCount = 1 + getSecureRandom(2); // 1-2 numbers for random insertion
          const wordsWithNumbers = [...words];
          for (let i = 0; i < numberCount; i++) {
            const randomWordIndex = getSecureRandom(wordsWithNumbers.length);
            const randomNumber = getSecureRandom(10).toString();
            // Insert number at a random position within the word or append/prepend
            if (wordsWithNumbers[randomWordIndex].length > 0 && Math.random() > 0.5) {
                 const insertPos = getSecureRandom(wordsWithNumbers[randomWordIndex].length + 1);
                 wordsWithNumbers[randomWordIndex] = wordsWithNumbers[randomWordIndex].slice(0, insertPos) + randomNumber + wordsWithNumbers[randomWordIndex].slice(insertPos);
            } else {
                 wordsWithNumbers[randomWordIndex] += randomNumber;
            }
          }
          passphrase = wordsWithNumbers.join(
            settings.separator === 'none' ? '' : settings.separator,
          );
        } else {
          passphrase = words.join(
            settings.separator === 'none' ? '' : settings.separator,
          );
          if (settings.includeNumbers) {
            const numberCount = 2 + getSecureRandom(3); // 2-4 numbers appended
            for (let i = 0; i < numberCount; i++) {
              passphrase += getSecureRandom(10);
            }
          }
        }

        const entropy = Math.log2(wordSource.length ** settings.wordCount);
        const strength = calculateStrength(passphrase);

        // Create history entry
        const historyEntry: PasswordHistory = {
          id: Date.now().toString(),
          password: passphrase,
          type: 'passphrase',
          createdAt: new Date(),
          strength: { score: strength.score, label: strength.label },
        };

        onSuccess(passphrase, historyEntry);

        toast.success(
          `${strength.label} passphrase generated! (${Math.round(entropy)} bits entropy)`,
        );
      } catch {
        toast.error('Failed to generate passphrase');
      }
    },
    [],
  );

  return {
    generatePassphrase,
  };
};
