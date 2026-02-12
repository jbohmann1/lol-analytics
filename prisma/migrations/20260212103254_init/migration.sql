-- CreateTable
CREATE TABLE "Player" (
    "puuid" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "gameName" TEXT NOT NULL,
    "tagLine" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("puuid")
);

-- CreateTable
CREATE TABLE "Match" (
    "matchId" TEXT NOT NULL,
    "regionGroup" TEXT NOT NULL,
    "gameCreation" BIGINT,
    "gameVersion" TEXT,
    "queueId" INTEGER,
    "rawJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("matchId")
);

-- CreateTable
CREATE TABLE "PlayerMatch" (
    "puuid" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,

    CONSTRAINT "PlayerMatch_pkey" PRIMARY KEY ("puuid","matchId")
);

-- CreateIndex
CREATE INDEX "PlayerMatch_matchId_idx" ON "PlayerMatch"("matchId");

-- AddForeignKey
ALTER TABLE "PlayerMatch" ADD CONSTRAINT "PlayerMatch_puuid_fkey" FOREIGN KEY ("puuid") REFERENCES "Player"("puuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerMatch" ADD CONSTRAINT "PlayerMatch_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("matchId") ON DELETE CASCADE ON UPDATE CASCADE;
