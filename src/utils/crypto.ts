// Secure random number generation
export const getSecureRandom = (max: number): number => {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] % max;
};
