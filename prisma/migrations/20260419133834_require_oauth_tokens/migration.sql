/*
  Warnings:

  - Made the column `accessToken` on table `OAuthAccount` required. This step will fail if there are existing NULL values in that column.
  - Made the column `refreshToken` on table `OAuthAccount` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "OAuthAccount" ALTER COLUMN "accessToken" SET NOT NULL,
ALTER COLUMN "refreshToken" SET NOT NULL;
