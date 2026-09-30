CREATE TYPE "WarehouseType" AS ENUM ('STORAGE', 'VEHICLE');

ALTER TABLE "warehouses"
ADD COLUMN "type" "WarehouseType" NOT NULL DEFAULT 'STORAGE';

ALTER TABLE "inventory_movements"
ADD COLUMN "idempotencyKey" VARCHAR(120);

CREATE UNIQUE INDEX "inventory_movements_idempotencyKey_key"
ON "inventory_movements"("idempotencyKey");

CREATE TABLE "vehicles" (
  "id" UUID NOT NULL,
  "code" VARCHAR(32) NOT NULL,
  "registrationNumber" VARCHAR(32) NOT NULL,
  "description" VARCHAR(255),
  "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
  "warehouseId" UUID NOT NULL,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "vehicles_code_key" ON "vehicles"("code");
CREATE UNIQUE INDEX "vehicles_registrationNumber_key" ON "vehicles"("registrationNumber");
CREATE UNIQUE INDEX "vehicles_warehouseId_key" ON "vehicles"("warehouseId");
CREATE INDEX "vehicles_status_idx" ON "vehicles"("status");

ALTER TABLE "vehicles"
ADD CONSTRAINT "vehicles_warehouseId_fkey"
FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "delivery_trips"
ADD COLUMN "driverId" TEXT,
ADD COLUMN "vehicleId" UUID;

CREATE INDEX "delivery_trips_driverId_plannedDate_idx" ON "delivery_trips"("driverId", "plannedDate");
CREATE INDEX "delivery_trips_vehicleId_plannedDate_idx" ON "delivery_trips"("vehicleId", "plannedDate");

ALTER TABLE "delivery_trips"
ADD CONSTRAINT "delivery_trips_driverId_fkey"
FOREIGN KEY ("driverId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "delivery_trips"
ADD CONSTRAINT "delivery_trips_vehicleId_fkey"
FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "deliveries"
ADD COLUMN "returnedAt" TIMESTAMPTZ(3),
ADD COLUMN "failureReason" VARCHAR(500),
ADD COLUMN "proofReference" VARCHAR(255);

CREATE UNIQUE INDEX "deliveries_one_active_trip_per_order_key"
ON "deliveries"("salesOrderId")
WHERE "status" IN ('PENDING', 'LOADED', 'IN_TRANSIT');

ALTER TABLE "warehouses"
ADD CONSTRAINT "warehouses_vehicle_default_check"
CHECK ("type" <> 'VEHICLE' OR "isDefault" = false);
