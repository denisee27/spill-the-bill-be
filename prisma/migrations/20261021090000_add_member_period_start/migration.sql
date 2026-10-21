-- Add memberPeriodStart to User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "memberPeriodStart" TIMESTAMP(3);

-- Update renewalPeriodDays default to 180
ALTER TABLE "MemberSetting" ALTER COLUMN "renewalPeriodDays" SET DEFAULT 180;

-- Update existing record to 180 days
UPDATE "MemberSetting" SET "renewalPeriodDays" = 180;
