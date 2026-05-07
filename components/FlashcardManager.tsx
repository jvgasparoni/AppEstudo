"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type FlashcardItem = {
  id: number;
  front: string;
  subject: string;
  theme: string;
  intervalDays: number;
  easeFactor: number;
  reviewCount: number;
  lapseCount: number;
  nextReview: Date;
  _count: {
    reviews: number;
  };
};

export default function FlashcardManager({ flashcards }: { flashcards: FlashcardItem[] }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  async function deleteFlashcard(card: FlashcardItem) {
    const suffix = card._count.reviews ? ` Ele possui ${card._count.reviews} revisao(oes) que tambem serao removidas.` : "";
    if (!window.confirm(`Excluir este flashcard definitivamente?${suffix}`)) return;

    setDeletingId(card.id);
    setMessage("");
    const res = await fetch(`/api/flashcards/${card.id}?confirm=true`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    setDeletingId(null);

    if (!res.ok) {
      setMessage(data.message || "Nao foi possivel excluir o flashcard.");
      return;
    }

    setMessage("Flashcard excluido.");
    startTransition(() => router.refresh());
  }

  async function deleteAllFlashcards() {
    const confirmation = window.prompt("Digite DELETE_ALL para apagar todos os flashcards e revisoes.");
    if (confirmation !== "DELETE_ALL") {
      setMessage("Exclusao cancelada.");
      return;
    }

    setMessage("Apagando flashcards...");
    const res = await fetch("/api/flashcards?confirm=DELETE_ALL", { method: "DELETE" });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setMessage(data.message || "Nao foi possivel apagar os flashcards.");
      return;
    }

    setMessage(`Foram apagados ${data.deleted} flashcard(s).`);
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="card md:min-w-48">
          <p className="text-sm text-slate-500">Flashcards</p>
          <p className="text-2xl font-bold">{flashcards.length}</p>
        </div>
        <button className="btn border border-red-200 bg-red-50 text-red-700 hover:bg-red-100" type="button" onClick={deleteAllFlashcards}>
          Apagar todos
        </button>
      </div>

      {message && <p className="text-sm text-slate-700">{message}</p>}

      {flashcards.length === 0 ? (
        <div className="card text-sm text-slate-600">Nenhum flashcard cadastrado.</div>
      ) : (
        flashcards.map((card) => (
          <div className="card" key={card.id}>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="font-medium">{card.front}</p>
                <p className="text-sm">
                  {card.subject || "Sem materia"}/{card.theme || "Sem tema"} | intervalo: {card.intervalDays}d | facilidade:{" "}
                  {card.easeFactor.toFixed(2)}
                </p>
                <p className="text-xs text-slate-500">
                  revisoes: {card.reviewCount} | erros: {card.lapseCount} | proxima: {new Date(card.nextReview).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <button
                className="btn border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-60"
                type="button"
                disabled={deletingId === card.id || isPending}
                onClick={() => deleteFlashcard(card)}
              >
                {deletingId === card.id ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
