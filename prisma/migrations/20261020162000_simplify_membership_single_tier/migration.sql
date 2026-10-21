-- AlterTable: remove VIP + discount columns from MemberSetting
ALTER TABLE "MemberSetting"
  DROP COLUMN IF EXISTS "discountPercent",
  DROP COLUMN IF EXISTS "freeShippingMinAmount",
  DROP COLUMN IF EXISTS "vipMinMonthlyAmount",
  DROP COLUMN IF EXISTS "vipDiscountPercent",
  DROP COLUMN IF EXISTS "vipHasFreeShipping";

-- AlterTable: remove memberTier from User
ALTER TABLE "User"
  DROP COLUMN IF EXISTS "memberTier";
