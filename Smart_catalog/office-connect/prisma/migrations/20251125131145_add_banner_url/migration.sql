/*
  Warnings:

  - The primary key for the `_UserFavorites` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[name]` on the table `ActivityType` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[A,B]` on the table `_UserFavorites` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "bannerUrl" TEXT,
ALTER COLUMN "maxParticipants" SET DEFAULT 10;

-- AlterTable
ALTER TABLE "_UserFavorites" DROP CONSTRAINT "_UserFavorites_AB_pkey";

-- CreateIndex
CREATE UNIQUE INDEX "ActivityType_name_key" ON "ActivityType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_UserFavorites_AB_unique" ON "_UserFavorites"("A", "B");
