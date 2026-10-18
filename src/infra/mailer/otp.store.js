import prisma from '../db/prisma.js';

const TTL_MS = 10 * 60 * 1000; // 10 minutes

export function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function saveOtp(email, code) {
  const expiresAt = new Date(Date.now() + TTL_MS);
  const key = email.toLowerCase();
  // Delete any existing OTP for this email, then create new
  await prisma.otpCode.deleteMany({ where: { email: key } });
  await prisma.otpCode.create({ data: { email: key, code, expiresAt } });
}

export async function verifyOtp(email, code) {
  const key = email.toLowerCase();
  const entry = await prisma.otpCode.findFirst({
    where: { email: key },
    orderBy: { createdAt: 'desc' },
  });
  if (!entry) return false;
  if (new Date() > entry.expiresAt) {
    await prisma.otpCode.deleteMany({ where: { email: key } });
    return false;
  }
  if (entry.code !== code) return false;
  await prisma.otpCode.deleteMany({ where: { email: key } });
  return true;
}
