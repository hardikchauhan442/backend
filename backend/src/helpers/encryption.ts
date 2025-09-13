import crypto from 'crypto';

import pako from 'pako';

import { appError } from '@app/utils';
import { ErrorType } from '@app/constant';
// import { generateString } from './random';
import { environment } from '@app/config';
import { generateString } from './random';

//development
const { CHIPER, ENCRYPTION_KEY, CHIPER_IV } = environment;

if (!CHIPER || !ENCRYPTION_KEY || !CHIPER_IV) {
  throw new Error('Encryption environment variables are not set properly.');
}

// Encrypt Function
const algorithm = CHIPER as string;
const key = Buffer.from(ENCRYPTION_KEY, 'hex');
const iv = Buffer.from(CHIPER_IV, 'hex');

export function encrypt<T = any>(data: T): string {
  const json = JSON.stringify(data);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(json, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

/**
 * Decrypts a string and parses it back to original type.
 */
export function decrypt<T = any>(encryptedText: string): T {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return JSON.parse(decrypted);
}
// export { base64ToBuffer, compressData, decompressData, decrypt, encrypt };
