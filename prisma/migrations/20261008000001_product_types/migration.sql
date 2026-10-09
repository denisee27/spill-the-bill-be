CREATE TABLE IF NOT EXISTS "product_types" (
  "id"        TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "name"      TEXT NOT NULL,
  "slug"      TEXT NOT NULL,
  "color"     TEXT NOT NULL DEFAULT '#6b7280',
  "isActive"  BOOLEAN NOT NULL DEFAULT true,
  "order"     INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "product_types_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "product_types_slug_key" ON "product_types"("slug");

-- Seed existing types so current products are not orphaned
INSERT INTO "product_types" ("name", "slug", "color", "isActive", "order")
VALUES
  ('Jastip',   'JASTIP',   '#7c3aed', true, 0),
  ('Preloved',  'PRELOVED', '#0891b2', true, 1),
  ('Service',  'SERVICE',  '#059669', true, 2)
ON CONFLICT ("slug") DO NOTHING;
