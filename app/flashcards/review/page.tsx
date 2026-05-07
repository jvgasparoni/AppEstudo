import { prisma } from "@/lib/prisma";
import FlashcardReviewCard from "@/components/FlashcardReviewCard";

export default async function Review() {
  const c = await prisma.flashcard.findFirst({ where: { nextReview: { lte: new Date() } }, orderBy: { nextReview: "asc" } });
  if (!c) return <p className="card">Nenhum flashcard pendente hoje.</p>;

  return (
    <FlashcardReviewCard
      id={c.id}
      front={c.front}
      back={c.back}
      intervalDays={c.intervalDays}
      easeFactor={c.easeFactor}
      reviewCount={c.reviewCount}
      lapseCount={c.lapseCount}
    />
  );
}
