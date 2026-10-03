ALTER TABLE "customers" ALTER COLUMN "creditLimit" DROP DEFAULT;
ALTER TABLE "customers" ALTER COLUMN "creditLimit" DROP NOT NULL;

-- Previous zero values represented an unspecified limit; retain positive limits unchanged.
UPDATE "customers" SET "creditLimit" = NULL WHERE "creditLimit" = 0;
