import { useState, useCallback } from 'react';

export const usePinGenerator = () => {
  const [length, setLength] = useState(4);
  const [pin, setPin] = useState('');

  const generatePin = useCallback(() => {
    let newPin = '';
    for (let i = 0; i < length; i++) {
      newPin += Math.floor(Math.random() * 10).toString();
    }
    setPin(newPin);
    // Add toast notification for success
  }, [length]);

  return { pin, length, setLength, generatePin };
};
