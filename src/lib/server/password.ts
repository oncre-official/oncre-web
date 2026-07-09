import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

/** Lightweight scrypt hashing for the mock portal store — not the backend's bcrypt, just parity of behaviour. */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const derived = scryptSync(password, salt, 64);
  const stored_ = Buffer.from(hash, "hex");
  if (derived.length !== stored_.length) return false;
  return timingSafeEqual(derived, stored_);
}
