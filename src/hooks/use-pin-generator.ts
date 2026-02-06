import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { PasswordHistory, PinSettings } from "../types";
import { getSecureRandom } from "../utils/crypto";

export const usePinGenerator = () => {
  const [pin, setPin] = useState("");

  const generatePin = useCallback(
    (
      settings: PinSettings,
      onSuccess: (pin: string, historyEntry: PasswordHistory) => void
    ) => {
      const newPin = Array.from({ length: settings.length }, () =>
        getSecureRandom(10).toString()
      ).join("");
      setPin(newPin);

      const historyEntry: PasswordHistory = {
        id: Date.now().toString(),
        password: newPin,
        type: "pin",
        createdAt: new Date(),
        strength: { score: 1, label: "PIN" },
      };

      onSuccess(newPin, historyEntry);
      toast.success("Secure PIN generated!");
    },
    []
  );

  return { pin, generatePin };
};
