import crypto from "crypto";

const ENC_DEC = {
  CHIPER: process.env.NEXT_PUBLIC_CHIPER,
  ENCRYPTION_KEY: process.env.NEXT_PUBLIC_TERIFF,
  CHIPER_IV: process.env.NEXT_PUBLIC_PLAN,
};

const { CHIPER, ENCRYPTION_KEY, CHIPER_IV } = ENC_DEC;

if (!CHIPER || !ENCRYPTION_KEY || !CHIPER_IV) {
  throw new Error("Encryption environment variables are not set properly.");
}

const algorithm = CHIPER as string;
const key = Buffer.from(ENCRYPTION_KEY, "hex");
const iv = Buffer.from(CHIPER_IV, "hex");

export function encrypt<T = any>(data: T): { data: string } {
  const json = JSON.stringify(data);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(json, "utf8", "hex");
  encrypted += cipher.final("hex");
  return { data: encrypted };
}

export function decrypt<T = any>(encryptedText: string): T {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  // console.log(decrypted, "Decrypted String");

  return JSON.parse(decrypted);
}
