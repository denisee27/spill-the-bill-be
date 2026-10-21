-- AlterTable
ALTER TABLE "MemberSetting" ALTER COLUMN "hasFreeShipping" SET DEFAULT true;

-- Update existing record
UPDATE "MemberSetting" SET "hasFreeShipping" = true;
