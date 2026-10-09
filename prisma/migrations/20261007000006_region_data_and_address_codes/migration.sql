-- Add region code fields to Address
ALTER TABLE "Address" ADD COLUMN IF NOT EXISTS "provinceCode" CHAR(2);
ALTER TABLE "Address" ADD COLUMN IF NOT EXISTS "regencyCode" CHAR(4);
ALTER TABLE "Address" ADD COLUMN IF NOT EXISTS "districtCode" CHAR(6);
ALTER TABLE "Address" ADD COLUMN IF NOT EXISTS "villageCode" CHAR(10);
ALTER TABLE "Address" ALTER COLUMN "postalCode" DROP NOT NULL;

-- Add region code fields to Origin
ALTER TABLE "Origin" ADD COLUMN IF NOT EXISTS "provinceCode" CHAR(2);
ALTER TABLE "Origin" ADD COLUMN IF NOT EXISTS "regencyCode" CHAR(4);

-- Indonesian Administrative Region tables
DROP TABLE IF EXISTS "reg_villages";
DROP TABLE IF EXISTS "reg_districts";
DROP TABLE IF EXISTS "reg_regencies";
DROP TABLE IF EXISTS "reg_provinces";

CREATE TABLE "reg_provinces" (
  id CHAR(2) PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE "reg_regencies" (
  id CHAR(4) PRIMARY KEY,
  province_id CHAR(2) NOT NULL,
  name VARCHAR(255) NOT NULL,
  CONSTRAINT fk_regency_province FOREIGN KEY (province_id) REFERENCES reg_provinces(id)
);

CREATE TABLE "reg_districts" (
  id CHAR(6) PRIMARY KEY,
  regency_id CHAR(4) NOT NULL,
  name VARCHAR(255) NOT NULL,
  CONSTRAINT fk_district_regency FOREIGN KEY (regency_id) REFERENCES reg_regencies(id)
);

CREATE TABLE "reg_villages" (
  id CHAR(10) PRIMARY KEY,
  district_id CHAR(6) NOT NULL,
  name VARCHAR(255) NOT NULL,
  CONSTRAINT fk_village_district FOREIGN KEY (district_id) REFERENCES reg_districts(id)
);

-- Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_regencies_province_id ON "reg_regencies"(province_id);
CREATE INDEX IF NOT EXISTS idx_districts_regency_id ON "reg_districts"(regency_id);
CREATE INDEX IF NOT EXISTS idx_villages_district_id ON "reg_villages"(district_id);
