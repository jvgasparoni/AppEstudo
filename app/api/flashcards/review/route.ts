import { prisma } from "@/lib/prisma";
import { nextSrs, Rating } from "@/lib/srs";
import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";

export async function POST(req: Request) {
  const f = await req.formData();
  const id = Number(f.get("flashcardId"));
  const rating = String(f.get("rating")) as Rating;
  const card = await prisma.flashcard.findUnique({ where: { id } });
  if (!card) return new Response("Flashcard não encontrado", { status: 404 });

  const nextState = nextSrs({ intervalDays: card.intervalDays, easeFactor: card.easeFactor, reviewCount: card.reviewCount, lapseCount: card.lapseCount }, rating, { againToday: true });
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + nextState.intervalDays);

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.flashcardReview.create({
      data: {
        flashcardId: id,
        rating,
        previousInterval: card.intervalDays,
        newInterval: nextState.intervalDays,
        previousEaseFactor: card.easeFactor,
        newEaseFactor: nextState.easeFactor,
        nextReview: nextDate,
      },
    });

    await tx.flashcard.update({
      where: { id },
      data: {
        intervalDays: nextState.intervalDays,
        easeFactor: nextState.easeFactor,
        reviewCount: nextState.reviewCount,
        lapseCount: nextState.lapseCount,
        nextReview: nextDate,
      },
    });
  });

  redirect("/flashcards/review");
}
