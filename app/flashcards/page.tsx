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
      <form action="/api/flashcards" method="post" className="card grid gap-3 md:grid-cols-2">
        <label>
          <span className="text-sm font-medium text-slate-700">Frente</span>
          <input name="front" className="input mt-1" placeholder="Pergunta ou pista" required />
        </label>
        <label>
          <span className="text-sm font-medium text-slate-700">Verso</span>
          <input name="back" className="input mt-1" placeholder="Resposta" required />
        </label>
        <label>
          <span className="text-sm font-medium text-slate-700">Materia</span>
          <input name="subject" className="input mt-1" placeholder="Materia" />
        </label>
        <label>
          <span className="text-sm font-medium text-slate-700">Tema</span>
          <input name="theme" className="input mt-1" placeholder="Tema" />
        </label>
        <label className="md:col-span-2">
          <span className="text-sm font-medium text-slate-700">Tags</span>
          <input name="tags" className="input mt-1" placeholder="Tags" />
        </label>
        <div className="md:col-span-2">
          <button className="btn-primary">Criar flashcard</button>
        </div>
      </form>

      <FlashcardManager flashcards={data} />
    </div>
  );
}
