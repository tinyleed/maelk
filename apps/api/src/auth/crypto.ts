import { createCipheriv, createDecipheriv, createHash, randomBytes, timingSafeEqual } from "node:crypto";

const SESSION_HASH_PREFIX = "maelk-session-v1";
const CSRF_HASH_PREFIX = "maelk-csrf-v1";
const REFRESH_TOKEN_CIPHER_PREFIX = "v1";

export function generateOpaqueToken(byteLength = 32): string {
  return randomBytes(byteLength).toString("base64url");
}

export function hashSessionIdentifier(identifier: string): string {
  return hashWithPrefix(SESSION_HASH_PREFIX, identifier);
}

export function hashCsrfToken(token: string): string {
  return hashWithPrefix(CSRF_HASH_PREFIX, token);
}

export function safeEqualHash(left: string, right: string): boolean {
  const leftBytes = Buffer.from(left, "utf8");
  const rightBytes = Buffer.from(right, "utf8");
  return leftBytes.length === rightBytes.length && timingSafeEqual(leftBytes, rightBytes);
}

export class RefreshTokenCipher {
  private readonly key: Buffer;

  constructor(keyBase64Url: string) {
    const key = Buffer.from(keyBase64Url, "base64url");
    if (key.length !== 32) {
      throw new Error("session_encryption_key_invalid");
    }
    this.key = key;
  }

  encrypt(plaintext: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", this.key, iv);
    const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    return [
      REFRESH_TOKEN_CIPHER_PREFIX,
      iv.toString("base64url"),
      tag.toString("base64url"),
      ciphertext.toString("base64url"),
    ].join(":");
  }

  decrypt(ciphertextEnvelope: string): string {
    const [version, ivBase64Url, tagBase64Url, ciphertextBase64Url] = ciphertextEnvelope.split(":");
    if (version !== REFRESH_TOKEN_CIPHER_PREFIX || !ivBase64Url || !tagBase64Url || !ciphertextBase64Url) {
      throw new Error("refresh_token_ciphertext_invalid");
    }

    const decipher = createDecipheriv("aes-256-gcm", this.key, Buffer.from(ivBase64Url, "base64url"));
    decipher.setAuthTag(Buffer.from(tagBase64Url, "base64url"));
    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(ciphertextBase64Url, "base64url")),
      decipher.final(),
    ]);
    return plaintext.toString("utf8");
  }
}

function hashWithPrefix(prefix: string, value: string): string {
  return createHash("sha256").update(prefix).update("\0").update(value).digest("base64url");
}
