import { readFlashcardFormData, validateFlashcardInput } from "@/lib/flashcards";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";

export async function POST(req: Request) {
  const f = await req.formData();
  const data = readFlashcardFormData(f);
  const error = validateFlashcardInput(data);

  if (error) return Response.json({ message: error }, { status: 400 });

  await prisma.flashcard.create({ data });
  redirect("/flashcards");
}

export async function DELETE(req: Request) {
  const confirmation = new URL(req.url).searchParams.get("confirm");
  if (confirmation !== "DELETE_ALL") {
    return Response.json({ message: "confirmacao obrigatoria: ?confirm=DELETE_ALL" }, { status: 400 });
  }

  const deleted = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.flashcardReview.deleteMany();
    const flashcards = await tx.flashcard.deleteMany();
    return flashcards.count;
  });

  return Response.json({ ok: true, deleted });
}
