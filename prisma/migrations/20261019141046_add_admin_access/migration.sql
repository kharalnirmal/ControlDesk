-- CreateTable
CREATE TABLE "AdminAccess" (
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAccess_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "AdminAccess" ADD CONSTRAINT "AdminAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
