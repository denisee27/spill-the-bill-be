ALTER TABLE "User" ADD COLUMN "isVerified" BOOLEAN NOT NULL DEFAULT false;

-- Backfill: semua user existing sudah verified (OTP wajib saat registrasi)
UPDATE "User" SET "isVerified" = true;
