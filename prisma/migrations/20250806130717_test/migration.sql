-- AlterTable
ALTER TABLE "public"."matches" ADD COLUMN     "awayScore" INTEGER,
ADD COLUMN     "awayTeam" TEXT DEFAULT '',
ADD COLUMN     "awayTeamId" TEXT DEFAULT '';

-- AddForeignKey
ALTER TABLE "public"."matches" ADD CONSTRAINT "matches_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "public"."teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;
