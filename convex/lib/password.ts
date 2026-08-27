import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const algorithm = 'scrypt';
const saltLength = 16;
const keyLength = 64;
const cost = Math.pow(2, 14); // N parameter

export function hashPassword(password: string): string {
  const salt = randomBytes(saltLength).toString('hex');
  const hash = scryptSync(password, salt, keyLength, { cost });
  return `${algorithm}\$${salt}\$${hash.toString('hex')}`;
}

export function verifyPassword(password: string, hashed: string): boolean {
  const [alg, salt, hashHex] = hashed.split('$');
  if (alg !== algorithm) {
    throw new Error('Unsupported hash algorithm');
  }
  const hashBuf = Buffer.from(hashHex, 'hex');
  const computedHash = scryptSync(password, salt, keyLength, { cost });
  return timingSafeEqual(hashBuf, computedHash);
}