/*
  Warnings:

  - Added the required column `geom` to the `Estate` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Estate" ADD COLUMN     "geom" geography(Point, 4326) NOT NULL;
