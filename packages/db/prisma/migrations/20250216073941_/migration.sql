/*
  Warnings:

  - The values [Other] on the enum `EthnecityEnum` will be removed. If these variants are still used in the database, this will fail.
  - The values [Other] on the enum `ModelTypeEnum` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `age` to the `Model` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EthnecityEnum_new" AS ENUM ('Black', 'White', 'Asian American', 'East Asian', 'South East Asian', 'South Asian', 'Middle Eastern', 'Pacific', 'Hispanic');
ALTER TABLE "Model" ALTER COLUMN "etnecity" TYPE "EthnecityEnum_new" USING ("etnecity"::text::"EthnecityEnum_new");
ALTER TYPE "EthnecityEnum" RENAME TO "EthnecityEnum_old";
ALTER TYPE "EthnecityEnum_new" RENAME TO "EthnecityEnum";
DROP TYPE "EthnecityEnum_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ModelTypeEnum_new" AS ENUM ('Man', 'Woman', 'Others');
ALTER TABLE "Model" ALTER COLUMN "type" TYPE "ModelTypeEnum_new" USING ("type"::text::"ModelTypeEnum_new");
ALTER TYPE "ModelTypeEnum" RENAME TO "ModelTypeEnum_old";
ALTER TYPE "ModelTypeEnum_new" RENAME TO "ModelTypeEnum";
DROP TYPE "ModelTypeEnum_old";
COMMIT;

-- AlterTable
ALTER TABLE "Model" ADD COLUMN     "age" INTEGER NOT NULL;
