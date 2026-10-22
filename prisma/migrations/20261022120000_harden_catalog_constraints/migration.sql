-- Harden catalog invariants for writes that bypass application validation.
-- Expression indexes enforce uniqueness using the same canonical forms used by
-- the server actions while retaining the original Prisma-managed constraints.
CREATE UNIQUE INDEX "Category_name_normalized_key"
ON "Category" (lower(regexp_replace(btrim("name"), '\s+', ' ', 'g')));

CREATE UNIQUE INDEX "Product_sku_normalized_key"
ON "Product" (upper(btrim("sku")));

ALTER TABLE "Product"
ADD CONSTRAINT "Product_stock_maximum"
CHECK ("stock" <= 1000000);
