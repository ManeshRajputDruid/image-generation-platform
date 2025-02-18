/*
  Warnings:

  - The values [Generated] on the enum `OutputImagesStatusEnum` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `updatedAt` to the `OutputImages` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ModelTrainingStatusEnum" AS ENUM ('Pending', 'generated', 'Failed');

-- AlterEnum
BEGIN;
CREATE TYPE "OutputImagesStatusEnum_new" AS ENUM ('Pending', 'generated', 'Failed');
ALTER TABLE "OutputImages" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "OutputImages" ALTER COLUMN "status" TYPE "OutputImagesStatusEnum_new" USING ("status"::text::"OutputImagesStatusEnum_new");
ALTER TYPE "OutputImagesStatusEnum" RENAME TO "OutputImagesStatusEnum_old";
ALTER TYPE "OutputImagesStatusEnum_new" RENAME TO "OutputImagesStatusEnum";
DROP TYPE "OutputImagesStatusEnum_old";
ALTER TABLE "OutputImages" ALTER COLUMN "status" SET DEFAULT 'Pending';
COMMIT;

-- AlterTable
ALTER TABLE "Model" ADD COLUMN     "falAiRequestId" TEXT,
ADD COLUMN     "trainingStatus" "ModelTrainingStatusEnum" NOT NULL DEFAULT 'Pending';

-- AlterTable
ALTER TABLE "OutputImages" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "falAiRequestId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
