import { prisma } from "@/lib/prisma";

type FlashcardItem = { id: number; front: string; subject: string; theme: string; intervalDays: number; easeFactor: number; reviewCount: number; lapseCount: number; nextReview: Date };

export default async function Flashcards() {
  const data = (await prisma.flashcard.findMany({ take: 50, orderBy: { nextReview: "asc" } })) as FlashcardItem[];

  return (
    <div className="space-y-3">
      <form action="/api/flashcards" method="post" className="card grid gap-2">
        {["front", "back", "subject", "theme", "tags"].map((f) => <input key={f} name={f} className="input" placeholder={f} />)}
        <button className="btn-primary">Criar</button>
      </form>

      {data.map((c: FlashcardItem) => (
        <div className="card" key={c.id}>
          <p className="font-medium">{c.front}</p>
          <p className="text-sm">{c.subject}/{c.theme} | intervalo: {c.intervalDays}d | facilidade: {c.easeFactor.toFixed(2)}</p>
          <p className="text-xs text-slate-500">revisões: {c.reviewCount} | erros: {c.lapseCount} | próxima: {new Date(c.nextReview).toLocaleDateString("pt-BR")}</p>
        </div>
      ))}
    </div>
  );
}
