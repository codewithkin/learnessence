/*
  Warnings:

  - You are about to drop the column `sourceType` on the `Note` table. All the data in the column will be lost.
  - Made the column `title` on table `Note` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Note" DROP COLUMN "sourceType",
ALTER COLUMN "title" SET NOT NULL;
