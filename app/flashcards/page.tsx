import FlashcardForm from "@/components/FlashcardForm";
import FlashcardManager from "@/components/FlashcardManager";
import { prisma } from "@/lib/prisma";

export default async function Flashcards() {
  const data = await prisma.flashcard.findMany({
    orderBy: { nextReview: "asc" },
    include: {
      _count: {
        select: { reviews: true },
      },
    },
  });

  return (
    <div className="space-y-4">
      <FlashcardForm action="/api/flashcards" submitLabel="Criar flashcard" />

      <FlashcardManager flashcards={data} />
    </div>
  );
}
