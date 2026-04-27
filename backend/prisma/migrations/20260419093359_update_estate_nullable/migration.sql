/*
  Warnings:

  - You are about to drop the column `geo_code` on the `Estate` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Estate" DROP COLUMN "geo_code",
ALTER COLUMN "address" DROP NOT NULL,
ALTER COLUMN "rent_price" DROP NOT NULL,
ALTER COLUMN "fee_info" DROP NOT NULL,
ALTER COLUMN "img" DROP NOT NULL,
ALTER COLUMN "url" DROP NOT NULL,
ALTER COLUMN "floor_plan" DROP NOT NULL,
ALTER COLUMN "area" DROP NOT NULL,
ALTER COLUMN "years_old" DROP NOT NULL,
ALTER COLUMN "floor_num" DROP NOT NULL,
ALTER COLUMN "geom" DROP NOT NULL;
