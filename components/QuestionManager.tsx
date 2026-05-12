"use client";

import ClavisLessonPicker from "@/components/ClavisLessonPicker";
import QuestionImportPanel from "@/components/QuestionImportPanel";
import { CLAVIS_ORIGIN } from "@/lib/clavis";
import { questionDifficultyLabels } from "@/lib/questions";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

type QuestionItem = {
  id: number;
  statement: string;
  subject: string;
  theme: string;
  difficulty: string;
  tags: string;
  origin: string;
  lessonNumber: number | null;
  reviewed: boolean;
  createdAt: Date;
  _count: {
    attempts: number;
    examQuestions: number;
  };
};

export default function QuestionManager({
  questions,
  query,
  clavisLessonCounts = {},
}: {
  questions: QuestionItem[];
  query: string;
  clavisLessonCounts?: Record<number, number>;
}) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);
  const [forceEmpty, setForceEmpty] = useState(false);
  const [showClavisImport, setShowClavisImport] = useState(false);
  const [showClavisPractice, setShowClavisPractice] = useState(false);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const displayedQuestions = forceEmpty ? [] : questions;

  useEffect(() => {
    if (questions.length > 0) setForceEmpty(false);
  }, [questions]);

  async function deleteQuestion(item: QuestionItem) {
    const uses = item._count.attempts + item._count.examQuestions;
    const suffix = uses ? ` Ela possui ${uses} registro(s) de uso que tambem serao removidos.` : "";
    if (!window.confirm(`Excluir esta questao definitivamente?${suffix}`)) return;

    setDeletingId(item.id);
    setMessage("");
    const res = await fetch(`/api/questions/${item.id}?confirm=true`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    setDeletingId(null);

    if (!res.ok) {
      setMessage(data.message || "Nao foi possivel excluir a questao.");
      return;
    }

    setMessage("Questao excluida.");
    startTransition(() => router.refresh());
  }

  async function deleteAllQuestions() {
    const confirmation = window.prompt(
      "Digite DELETE_ALL para apagar definitivamente todas as questoes, tentativas e simulados vinculados.",
    );
    if (confirmation !== "DELETE_ALL") {
      setMessage("Exclusao cancelada.");
      return;
    }

    setDeletingAll(true);
    setMessage("Apagando todas as questoes...");
    const res = await fetch("/api/questions/import?confirm=DELETE_ALL", { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    setDeletingAll(false);

    if (!res.ok) {
      setMessage(data.message || "Nao foi possivel apagar as questoes.");
      return;
    }

    setForceEmpty(true);
    setMessage(`Foram apagadas ${data.deleted} questao(oes).`);
    startTransition(() => router.refresh());
  }

  function refreshQuestions() {
    setForceEmpty(false);
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-4">
      <section className="card space-y-3">
        <div className="flex flex-wrap gap-2">
          <button
            className={showClavisImport ? "btn-primary" : "btn border bg-white"}
            type="button"
            onClick={() => {
              setShowClavisImport((current) => !current);
              setShowClavisPractice(false);
            }}
          >
            Importar Clavis
          </button>
          <button
            className={showClavisPractice ? "btn-primary" : "btn border bg-white"}
            type="button"
            onClick={() => {
              setShowClavisPractice((current) => !current);
              setShowClavisImport(false);
            }}
          >
            Praticar Clavis
          </button>
          <button
            className="btn border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-60"
            type="button"
            disabled={deletingAll || isPending}
            onClick={deleteAllQuestions}
          >
            {deletingAll ? "Deletando..." : "Deletar todas as quest\u00f5es"}
          </button>
        </div>
      </section>

      {showClavisImport && <QuestionImportPanel kind="clavis" onImported={refreshQuestions} />}

      {showClavisPractice && (
        <section className="card space-y-3">
          <p className="font-semibold">Praticar Clavis</p>
          <ClavisLessonPicker counts={clavisLessonCounts} />
        </section>
      )}

      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <form className="flex-1">
          <label className="text-sm font-medium text-slate-700" htmlFor="question-search">
            Buscar questoes
          </label>
          <div className="mt-1 flex gap-2">
            <input id="question-search" name="q" placeholder="Enunciado, tag, materia ou tema" defaultValue={query} className="input" />
            <button className="btn-primary shrink-0">Buscar</button>
          </div>
        </form>
        <div className="flex gap-2">
          <a href="/questions/new" className="btn border bg-white">
            Nova
          </a>
          <a href="/questions/import" className="btn border bg-white">
            Importar
          </a>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <div className="card">
          <p className="text-sm text-slate-500">Na lista</p>
          <p className="text-2xl font-bold">{displayedQuestions.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Respondidas</p>
          <p className="text-2xl font-bold">{displayedQuestions.filter((q) => q._count.attempts > 0).length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Sem uso</p>
          <p className="text-2xl font-bold">{displayedQuestions.filter((q) => q._count.attempts === 0 && q._count.examQuestions === 0).length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Revisadas</p>
          <p className="text-2xl font-bold">{displayedQuestions.filter((q) => q.reviewed).length}</p>
        </div>
      </div>

      {message && <p className="text-sm text-slate-700">{message}</p>}

      <div className="space-y-3">
        {displayedQuestions.length === 0 ? (
          <div className="card text-sm text-slate-600">Nenhuma questao encontrada.</div>
        ) : (
          displayedQuestions.map((item) => (
            <article key={item.id} className="card space-y-3">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap gap-2 text-xs text-slate-600">
                    {item.origin === CLAVIS_ORIGIN && <span className="rounded border border-blue-200 bg-blue-50 px-2 py-1 text-blue-700">Clavis aula {item.lessonNumber || "-"}</span>}
                    <span className="rounded border px-2 py-1">{item.subject || "Sem materia"}</span>
                    <span className="rounded border px-2 py-1">{item.theme || "Sem tema"}</span>
                    <span className="rounded border px-2 py-1">{questionDifficultyLabels[item.difficulty as keyof typeof questionDifficultyLabels] || item.difficulty}</span>
                    {item.tags && <span className="rounded border px-2 py-1">{item.tags}</span>}
                  </div>
                  <p className="font-semibold leading-snug">{item.statement}</p>
                </div>

                <div className="flex gap-2">
                  <a className="btn border bg-white" href={`/questions/${item.id}/edit`}>
                    Editar
                  </a>
                  <button
                    className="btn border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-60"
                    type="button"
                    disabled={deletingId === item.id || isPending}
                    onClick={() => deleteQuestion(item)}
                  >
                    {deletingId === item.id ? "Excluindo..." : "Excluir"}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                <span>{item._count.attempts} tentativa(s)</span>
                <span>{item._count.examQuestions} simulado(s)</span>
                <span>Criada em {new Date(item.createdAt).toLocaleDateString("pt-BR")}</span>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
