import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "hematin_session";
export const SESSION_DURATION_SECONDS = 30 * 24 * 60 * 60; // 30 days

const AUTH_SECRET = process.env.AUTH_SECRET || "hematin-app-secure-default-secret-2026";
export const OWNER_PASSWORD = process.env.OWNER_PASSWORD || "hematin123";

function base64urlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlEncodeString(str: string): string {
  const bytes = new TextEncoder().encode(str);
  return base64urlEncode(bytes.buffer);
}

function base64urlDecodeString(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

async function signData(data: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return base64urlEncode(signature);
}

/**
 * Generates a signed session token: payload.signature
 */
export async function createSessionToken(): Promise<string> {
  const payload = JSON.stringify({
    role: "owner",
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_DURATION_SECONDS * 1000,
  });

  const encodedPayload = base64urlEncodeString(payload);
  const signature = await signData(encodedPayload, AUTH_SECRET);
  return `${encodedPayload}.${signature}`;
}

/**
 * Verifies a session token. Returns true if valid and not expired.
 */
export async function verifySessionToken(token?: string | null): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [encodedPayload, providedSignature] = parts;
  const expectedSignature = await signData(encodedPayload, AUTH_SECRET);

  if (providedSignature !== expectedSignature) {
    return false;
  }

  try {
    const payloadStr = base64urlDecodeString(encodedPayload);
    const payload = JSON.parse(payloadStr);
    if (!payload.expiresAt || payload.expiresAt < Date.now()) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Get current session from Next.js server cookies.
 */
export async function getSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

/**
 * Set session cookie in Next.js response cookies.
 */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

/**
 * Remove session cookie (logout).
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
