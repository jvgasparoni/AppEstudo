"use client";

import { useState } from "react";

type Props = {
  id: number;
  front: string;
  back: string;
  intervalDays: number;
  easeFactor: number;
  reviewCount: number;
  lapseCount: number;
};

export default function FlashcardReviewCard({ id, front, back, intervalDays, easeFactor, reviewCount, lapseCount }: Props) {
  const [showBack, setShowBack] = useState(false);

  return (
    <form action="/api/flashcards/review" method="post" className="card space-y-3">
      <input type="hidden" name="flashcardId" value={id} />
      <div>
        <p className="text-xs text-slate-500">
          intervalo atual: {intervalDays} dia(s) | facilidade: {easeFactor.toFixed(2)} | revisoes: {reviewCount} | erros: {lapseCount}
        </p>
        <p className="mt-2 text-lg font-semibold">{front}</p>
      </div>

      {!showBack ? (
        <button type="button" className="btn border" onClick={() => setShowBack(true)}>
          Revelar resposta
        </button>
      ) : (
        <div className="space-y-3">
          <div className="rounded bg-slate-100 p-3">
            <p className="text-sm text-slate-700">Verso</p>
            <p>{back}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button name="rating" value="AGAIN" className="btn border border-red-400 text-red-700">
              Errei
            </button>
            <button name="rating" value="HARD" className="btn border border-amber-400 text-amber-700">
              Dificil
            </button>
            <button name="rating" value="GOOD" className="btn border border-blue-400 text-blue-700">
              Bom
            </button>
            <button name="rating" value="EASY" className="btn border border-green-400 text-green-700">
              Facil
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
