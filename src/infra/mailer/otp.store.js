// In-memory OTP store. Each entry: { code: string, expiresAt: number }
const store = new Map();

const TTL_MS = 10 * 60 * 1000; // 10 minutes

export function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function saveOtp(email, code) {
  store.set(email.toLowerCase(), { code, expiresAt: Date.now() + TTL_MS });
}

export function verifyOtp(email, code) {
  const entry = store.get(email.toLowerCase());
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    store.delete(email.toLowerCase());
    return false;
  }
  if (entry.code !== code) return false;
  store.delete(email.toLowerCase());
  return true;
}
