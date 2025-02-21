/*
  Warnings:

  - You are about to drop the `TrainingImages` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `zipUrl` to the `Model` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TrainingImages" DROP CONSTRAINT "TrainingImages_modelId_fkey";

-- AlterTable
ALTER TABLE "Model" ADD COLUMN     "zipUrl" TEXT NOT NULL;

-- DropTable
DROP TABLE "TrainingImages";

-- CreateIndex
CREATE INDEX "Model_falAiRequestId_idx" ON "Model"("falAiRequestId");

-- CreateIndex
CREATE INDEX "OutputImages_falAiRequestId_idx" ON "OutputImages"("falAiRequestId");
