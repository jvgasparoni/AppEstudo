"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function ExamHistoryActions({ examId }: { examId: number }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function deleteExam() {
    if (!window.confirm("Excluir este simulado realizado e suas respostas?")) return;

    setDeleting(true);
    const res = await fetch(`/api/exams/${examId}?confirm=true`, { method: "DELETE" });
    setDeleting(false);

    if (!res.ok) {
      window.alert("Nao foi possivel excluir o simulado.");
      return;
    }

    startTransition(() => router.refresh());
  }

  return (
    <div className="flex flex-wrap gap-2">
      <a className="btn border bg-white" href={`/exams/${examId}/review`}>
        Abrir
      </a>
      <button className="btn border border-red-200 bg-red-50 text-red-700 disabled:opacity-60" type="button" disabled={deleting || isPending} onClick={deleteExam}>
        {deleting ? "Excluindo..." : "Excluir"}
      </button>
    </div>
  );
}
