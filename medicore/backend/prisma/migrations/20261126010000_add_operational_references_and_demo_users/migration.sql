-- CreateTable
CREATE TABLE "operational_equipment" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "assetCode" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,

    CONSTRAINT "operational_equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operational_symptoms" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "operational_symptoms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operational_stations" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "location" TEXT,
    "floor" INTEGER NOT NULL,
    "ip" TEXT,

    CONSTRAINT "operational_stations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_records" (
    "id" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "type" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "technician" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "maintenance_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demo_users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,

    CONSTRAINT "demo_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "operational_equipment_assetCode_key" ON "operational_equipment"("assetCode");

-- CreateIndex
CREATE INDEX "operational_equipment_locationId_idx" ON "operational_equipment"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "operational_symptoms_label_key" ON "operational_symptoms"("label");

-- CreateIndex
CREATE INDEX "maintenance_records_equipmentId_date_idx" ON "maintenance_records"("equipmentId", "date");

-- AddForeignKey
ALTER TABLE "operational_equipment" ADD CONSTRAINT "operational_equipment_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "operational_locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_records" ADD CONSTRAINT "maintenance_records_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "operational_equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
