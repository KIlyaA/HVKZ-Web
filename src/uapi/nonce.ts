const NONCE_ALPHABET = 'abcdefghijklmnopqrstuvwxyz';
const NONCE_LENGTH = 30;

export default () => {
  const alphabetLength = NONCE_ALPHABET.length;
  let nonce = '';

  for (let i = 0; i < NONCE_LENGTH; i++) {
    const charIndex = Math.floor(Math.random() * alphabetLength);
    nonce += NONCE_ALPHABET[charIndex];
  }

  return nonce;
};