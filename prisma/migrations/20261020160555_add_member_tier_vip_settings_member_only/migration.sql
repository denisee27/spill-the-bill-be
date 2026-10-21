-- AlterTable
ALTER TABLE "MemberSetting" ADD COLUMN     "vipDiscountPercent" DOUBLE PRECISION NOT NULL DEFAULT 10,
ADD COLUMN     "vipHasFreeShipping" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "vipMinMonthlyAmount" DOUBLE PRECISION NOT NULL DEFAULT 1500000,
ALTER COLUMN "discountPercent" SET DEFAULT 5;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "memberOnly" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "memberTier" TEXT;
