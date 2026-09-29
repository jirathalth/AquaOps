CREATE TYPE "BillingCycle" AS ENUM ('NONE', 'DAY_15', 'END_OF_MONTH', 'DAY_15_AND_END_OF_MONTH', 'CUSTOM');

ALTER TABLE "customers"
ADD COLUMN "billingCycle" "BillingCycle" NOT NULL DEFAULT 'NONE',
ADD COLUMN "billingCycleNote" VARCHAR(200);

CREATE SEQUENCE "customer_code_seq" AS BIGINT MINVALUE 1 START 1;

DO $$
DECLARE
  current_max BIGINT;
BEGIN
  SELECT COALESCE(MAX(SUBSTRING("code" FROM 5)::BIGINT), 0)
  INTO current_max
  FROM "customers"
  WHERE "code" ~ '^CUS-[0-9]+$';

  IF current_max > 0 THEN
    PERFORM setval('"customer_code_seq"', current_max, true);
  END IF;
END $$;
