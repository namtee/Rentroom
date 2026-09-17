-- CreateEnum
CREATE TYPE "namtee888"."PropertyType" AS ENUM ('CONDO', 'ROOM_RENTAL', 'APARTMENT', 'DORMITORY', 'COMMERCIAL', 'OTHER');

-- CreateEnum
CREATE TYPE "namtee888"."RoomStatus" AS ENUM ('OCCUPIED', 'VACANT');

-- CreateEnum
CREATE TYPE "namtee888"."Gender" AS ENUM ('MALE', 'FEMALE', 'UNSPECIFIED');

-- CreateEnum
CREATE TYPE "namtee888"."LeaseStatus" AS ENUM ('ACTIVE', 'ENDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "namtee888"."PaymentStatus" AS ENUM ('PAID', 'PENDING', 'OVERDUE');

-- CreateEnum
CREATE TYPE "namtee888"."MaintenanceStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'DONE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "namtee888"."NotificationType" AS ENUM ('MAINTENANCE_NEW', 'PAYMENT_RECEIVED', 'LEASE_EXPIRING', 'ROOM_AVAILABLE');

-- CreateEnum
CREATE TYPE "namtee888"."Plan" AS ENUM ('FREE', 'PREMIUM');

-- CreateEnum
CREATE TYPE "namtee888"."UserRole" AS ENUM ('OWNER', 'MANAGER', 'STAFF');

-- CreateTable
CREATE TABLE "namtee888"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "role" "namtee888"."UserRole" NOT NULL DEFAULT 'OWNER',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "namtee888"."Property" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "namtee888"."PropertyType" NOT NULL DEFAULT 'CONDO',
    "typeLabel" TEXT,
    "plan" "namtee888"."Plan" NOT NULL DEFAULT 'FREE',

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "namtee888"."PropertyMember" (
    "userId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "role" "namtee888"."UserRole" NOT NULL,

    CONSTRAINT "PropertyMember_pkey" PRIMARY KEY ("userId","propertyId")
);

-- CreateTable
CREATE TABLE "namtee888"."Room" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "floor" INTEGER NOT NULL,
    "monthlyRent" INTEGER NOT NULL,
    "status" "namtee888"."RoomStatus" NOT NULL DEFAULT 'VACANT',
    "coverImageUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "namtee888"."Tenant" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "gender" "namtee888"."Gender" NOT NULL DEFAULT 'UNSPECIFIED',
    "phone" TEXT,
    "avatarUrl" TEXT,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "namtee888"."Lease" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "rent" INTEGER NOT NULL,
    "deposit" INTEGER NOT NULL,
    "status" "namtee888"."LeaseStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "Lease_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "namtee888"."Payment" (
    "id" TEXT NOT NULL,
    "leaseId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "period" TEXT NOT NULL,
    "status" "namtee888"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "namtee888"."Expense" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "spentAt" TIMESTAMP(3) NOT NULL,
    "note" TEXT,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "namtee888"."MaintenanceRequest" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "namtee888"."MaintenanceStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MaintenanceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "namtee888"."Notification" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "type" "namtee888"."NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "href" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "namtee888"."User"("email");

-- CreateIndex
CREATE INDEX "PropertyMember_propertyId_idx" ON "namtee888"."PropertyMember"("propertyId");

-- CreateIndex
CREATE INDEX "Room_propertyId_status_idx" ON "namtee888"."Room"("propertyId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Room_propertyId_number_key" ON "namtee888"."Room"("propertyId", "number");

-- CreateIndex
CREATE INDEX "Tenant_propertyId_idx" ON "namtee888"."Tenant"("propertyId");

-- CreateIndex
CREATE INDEX "Lease_roomId_status_idx" ON "namtee888"."Lease"("roomId", "status");

-- CreateIndex
CREATE INDEX "Lease_tenantId_status_idx" ON "namtee888"."Lease"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Lease_status_endDate_idx" ON "namtee888"."Lease"("status", "endDate");

-- CreateIndex
CREATE INDEX "Payment_leaseId_status_idx" ON "namtee888"."Payment"("leaseId", "status");

-- CreateIndex
CREATE INDEX "Payment_status_paidAt_idx" ON "namtee888"."Payment"("status", "paidAt");

-- CreateIndex
CREATE INDEX "Expense_propertyId_spentAt_idx" ON "namtee888"."Expense"("propertyId", "spentAt");

-- CreateIndex
CREATE INDEX "MaintenanceRequest_roomId_status_idx" ON "namtee888"."MaintenanceRequest"("roomId", "status");

-- CreateIndex
CREATE INDEX "MaintenanceRequest_createdAt_idx" ON "namtee888"."MaintenanceRequest"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_propertyId_createdAt_idx" ON "namtee888"."Notification"("propertyId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_propertyId_readAt_idx" ON "namtee888"."Notification"("propertyId", "readAt");

-- CreateIndex
CREATE INDEX "Notification_propertyId_type_href_idx" ON "namtee888"."Notification"("propertyId", "type", "href");

-- AddForeignKey
ALTER TABLE "namtee888"."PropertyMember" ADD CONSTRAINT "PropertyMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "namtee888"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "namtee888"."PropertyMember" ADD CONSTRAINT "PropertyMember_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "namtee888"."Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "namtee888"."Room" ADD CONSTRAINT "Room_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "namtee888"."Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "namtee888"."Tenant" ADD CONSTRAINT "Tenant_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "namtee888"."Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "namtee888"."Lease" ADD CONSTRAINT "Lease_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "namtee888"."Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "namtee888"."Lease" ADD CONSTRAINT "Lease_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "namtee888"."Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "namtee888"."Payment" ADD CONSTRAINT "Payment_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "namtee888"."Lease"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "namtee888"."Expense" ADD CONSTRAINT "Expense_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "namtee888"."Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "namtee888"."MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "namtee888"."Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "namtee888"."Notification" ADD CONSTRAINT "Notification_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "namtee888"."Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
