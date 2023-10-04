/*
  Warnings:

  - Added the required column `description` to the `Link` table without a default value. This is not possible if the table is not empty.
  - Added the required column `is_favorite` to the `Link` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Link" ADD COLUMN     "access_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "is_favorite" BOOLEAN NOT NULL;
