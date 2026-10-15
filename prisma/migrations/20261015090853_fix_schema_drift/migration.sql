-- DropForeignKey
ALTER TABLE "reg_districts" DROP CONSTRAINT "fk_district_regency";

-- DropForeignKey
ALTER TABLE "reg_regencies" DROP CONSTRAINT "fk_regency_province";

-- DropForeignKey
ALTER TABLE "reg_villages" DROP CONSTRAINT "fk_village_district";

-- DropIndex
DROP INDEX "idx_districts_regency_id";

-- DropIndex
DROP INDEX "idx_regencies_province_id";

-- DropIndex
DROP INDEX "idx_villages_district_id";

-- AlterTable
ALTER TABLE "Review" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "product_types" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "reg_districts" ALTER COLUMN "name" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "reg_provinces" ALTER COLUMN "name" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "reg_regencies" ALTER COLUMN "name" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "reg_villages" ALTER COLUMN "name" SET DATA TYPE TEXT;
