import { createCipheriv, createDecipheriv, randomBytes } from "crypto"

/**
 * Encrypts OAuth access/refresh tokens before they're stored in
 * social_accounts.access_token_encrypted / refresh_token_encrypted.
 * Server-side only — never import from client code.
 *
 * Requires TOKEN_ENCRYPTION_KEY: a 32-byte key, base64-encoded.
 * Generate one with: openssl rand -base64 32
 */
function getKey(): Buffer {
  const key = process.env.TOKEN_ENCRYPTION_KEY
  if (!key) {
    throw new Error(
      "TOKEN_ENCRYPTION_KEY is not configured. Generate one with `openssl rand -base64 32`."
    )
  }
  const buf = Buffer.from(key, "base64")
  if (buf.length !== 32) {
    throw new Error("TOKEN_ENCRYPTION_KEY must decode to exactly 32 bytes.")
  }
  return buf
}

export function encryptToken(plaintext: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv)
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ])
  const authTag = cipher.getAuthTag()
  // iv . authTag . ciphertext, all base64, colon-separated
  return [iv, authTag, encrypted].map((b) => b.toString("base64")).join(":")
}

export function decryptToken(encoded: string): string {
  const [ivB64, authTagB64, dataB64] = encoded.split(":")
  if (!ivB64 || !authTagB64 || !dataB64) {
    throw new Error("Malformed encrypted token.")
  }
  const decipher = createDecipheriv(
    "aes-256-gcm",
    getKey(),
    Buffer.from(ivB64, "base64")
  )
  decipher.setAuthTag(Buffer.from(authTagB64, "base64"))
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64")),
    decipher.final(),
  ])
  return decrypted.toString("utf8")
}
