import { readFlashcardFormData, validateFlashcardInput } from "@/lib/flashcards";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return Response.json({ message: "ID invalido" }, { status: 400 });

  const f = await req.formData();
  const data = readFlashcardFormData(f);
  const error = validateFlashcardInput(data);

  if (error) return Response.json({ message: error }, { status: 400 });

  const updated = await prisma.flashcard.update({ where: { id }, data });
  return Response.json(updated);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return Response.json({ message: "ID invalido" }, { status: 400 });

  const f = await req.formData();
  const data = readFlashcardFormData(f);
  const error = validateFlashcardInput(data);

  if (error) return Response.json({ message: error }, { status: 400 });

  await prisma.flashcard.update({ where: { id }, data });
  redirect("/flashcards");
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const confirmation = new URL(req.url).searchParams.get("confirm");

  if (!Number.isInteger(id)) return Response.json({ message: "ID invalido" }, { status: 400 });
  if (confirmation !== "true") return Response.json({ message: "confirmacao obrigatoria: ?confirm=true" }, { status: 400 });

  const deleted = await prisma.$transaction(async (tx) => {
    await tx.flashcardReview.deleteMany({ where: { flashcardId: id } });
    const result = await tx.flashcard.deleteMany({ where: { id } });
    return result.count;
  });

  if (!deleted) return Response.json({ message: "Flashcard nao encontrado" }, { status: 404 });

  return Response.json({ ok: true });
}
