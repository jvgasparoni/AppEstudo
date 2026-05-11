import FlashcardForm from "@/components/FlashcardForm";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function EditFlashcard({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) notFound();

  const flashcard = await prisma.flashcard.findUnique({ where: { id } });
  if (!flashcard) notFound();

  return (
    <div className="space-y-4">
      <div className="card">
        <p className="text-sm text-slate-500">Editar flashcard</p>
        <h2 className="text-xl font-semibold">Flashcard #{flashcard.id}</h2>
      </div>
      <FlashcardForm action={`/api/flashcards/${flashcard.id}`} submitLabel="Salvar alteracoes" initialValues={flashcard} />
    </div>
  );
}
