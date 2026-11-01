import { createHash, randomBytes } from "node:crypto";

export function generateAccessToken() {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function randomLocalPart() {
  const adjectives = ["swift", "bright", "nova", "pixel", "cloud", "lunar", "quick", "mint"];
  const nouns = ["mail", "box", "link", "wave", "bird", "star", "note", "drop"];
  const number = Math.floor(1000 + Math.random() * 9000);
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]}.${nouns[Math.floor(Math.random() * nouns.length)]}${number}`;
}

export function normalizeLocalPart(value: unknown) {
  const text = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (!text) return randomLocalPart();
  if (text.length < 3 || text.length > 40) throw new Error("Nama email harus terdiri dari 3–40 karakter.");
  if (!/^[a-z0-9](?:[a-z0-9._-]*[a-z0-9])?$/.test(text)) throw new Error("Gunakan huruf kecil, angka, titik, dash, atau underscore.");
  if (/\.\.|--|__/.test(text)) throw new Error("Nama email tidak boleh memakai karakter pemisah berulang.");
  return text;
}
