-- Add status column
ALTER TABLE "Product" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'DRAFT';

-- Transform existing data
UPDATE "Product" SET "status" = CASE WHEN "isActive" = true THEN 'ACTIVE' ELSE 'INACTIVE' END;

-- Drop old column
ALTER TABLE "Product" DROP COLUMN "isActive";
