-- DropForeignKey
ALTER TABLE "Flashcard" DROP CONSTRAINT "Flashcard_setId_fkey";

-- AddForeignKey
ALTER TABLE "Flashcard" ADD CONSTRAINT "Flashcard_setId_fkey" FOREIGN KEY ("setId") REFERENCES "FlashcardSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
