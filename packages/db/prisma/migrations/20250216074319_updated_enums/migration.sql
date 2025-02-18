/*
  Warnings:

  - You are about to drop the column `etnecity` on the `Model` table. All the data in the column will be lost.
  - Added the required column `ethnecity` to the `Model` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Model" DROP COLUMN "etnecity",
ADD COLUMN     "ethnecity" "EthnecityEnum" NOT NULL;
