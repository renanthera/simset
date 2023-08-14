-- CreateTable
CREATE TABLE "Sim" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "content" TEXT,

    CONSTRAINT "Sim_pkey" PRIMARY KEY ("id")
);
