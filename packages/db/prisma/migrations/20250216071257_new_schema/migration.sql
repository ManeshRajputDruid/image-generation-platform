/*
  Warnings:

  - The values [AsianAmerican,EastAsian,SouthEastAsian,SouthAsian,MiddleEastern] on the enum `EthnecityEnum` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EthnecityEnum_new" AS ENUM ('Black', 'White', 'Asian American', 'East Asian', 'South East Asian', 'South Asian', 'Middle Eastern', 'Pacific', 'Hispanic', 'Other');
ALTER TABLE "Model" ALTER COLUMN "etnecity" TYPE "EthnecityEnum_new" USING ("etnecity"::text::"EthnecityEnum_new");
ALTER TYPE "EthnecityEnum" RENAME TO "EthnecityEnum_old";
ALTER TYPE "EthnecityEnum_new" RENAME TO "EthnecityEnum";
DROP TYPE "EthnecityEnum_old";
COMMIT;
