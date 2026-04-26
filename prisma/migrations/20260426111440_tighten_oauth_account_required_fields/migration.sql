/*
  Warnings:

  - Made the column `tokenType` on table `OAuthAccount` required. This step will fail if there are existing NULL values in that column.
  - Made the column `accessTokenExpiresAt` on table `OAuthAccount` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "OAuthAccount" ALTER COLUMN "tokenType" SET NOT NULL,
ALTER COLUMN "accessTokenExpiresAt" SET NOT NULL;
