/*
  Warnings:

  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."UserType" AS ENUM ('USER', 'ADMIN');

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "role",
ADD COLUMN     "type" "public"."UserType" DEFAULT 'USER';

-- DropEnum
DROP TYPE "public"."Role";
