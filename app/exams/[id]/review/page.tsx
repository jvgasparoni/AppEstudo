import { getExamStats } from "@/lib/exam-results";
import { getQuestionDomain } from "@/lib/domains";
import { prisma } from "@/lib/prisma";
import { getQuestionOptionText, questionOptions } from "@/lib/questions";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ExamReviewPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) notFound();

  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      examQuestions: {
        orderBy: { position: "asc" },
        include: { question: true },
      },
      attempts: {
        where: { mode: "EXAM" },
        include: { question: true },
      },
    },
  });

  if (!exam) notFound();
  if (exam.attempts.length === 0) {
    return (
      <div className="card space-y-3">
        <p className="font-semibold">Este simulado ainda nao foi finalizado.</p>
        <Link className="btn-primary inline-block" href={`/exams/${exam.id}`}>
          Continuar simulado
        </Link>
      </div>
    );
  }

  const stats = getExamStats(exam);
  const attemptsByQuestion = new Map(exam.attempts.map((attempt) => [attempt.questionId, attempt]));

  return (
    <div className="space-y-4">
      <div className="card">
        <p className="text-sm text-slate-500">Revisao do simulado</p>
        <h2 className="text-xl font-semibold">{exam.title || `Simulado #${exam.id}`}</h2>
        <p className="text-sm text-slate-600">Realizado em {stats.completedAt ? stats.completedAt.toLocaleString("pt-BR") : "-"}</p>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="card">
          <p className="text-sm text-slate-500">Questoes</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Acertos</p>
          <p className="text-2xl font-bold">{stats.correct}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Erros</p>
          <p className="text-2xl font-bold">{stats.wrong}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Acerto</p>
          <p className="text-2xl font-bold">{stats.percentage}%</p>
        </div>
      </section>

      <section className="card space-y-3">
        <h3 className="font-semibold">Estatisticas por dominio</h3>
        <div className="space-y-2">
          {stats.byDomain.map((domain) => (
            <div key={domain.domain} className="grid gap-2 rounded border p-3 md:grid-cols-[1fr_repeat(4,90px)]">
              <p className="font-medium">{domain.domain}</p>
              <p>{domain.total} questoes</p>
              <p>{domain.correct} acertos</p>
              <p>{domain.wrong} erros</p>
              <p>{domain.percentage}%</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">Questoes</h3>
        {exam.examQuestions.map((examQuestion, index) => {
          const question = examQuestion.question;
          const attempt = attemptsByQuestion.get(question.id);
          const selected = attempt?.selectedOption || "-";
          const correct = question.correctOption;
          const isRight = selected === correct;

          return (
            <article key={examQuestion.id} className="card space-y-3">
              <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                <span className="rounded border px-2 py-1">Questao {index + 1}</span>
                <span className="rounded border px-2 py-1">{getQuestionDomain(question)}</span>
                <span className={isRight ? "rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-emerald-700" : "rounded border border-red-200 bg-red-50 px-2 py-1 text-red-700"}>
                  {isRight ? "Acerto" : "Erro"}
                </span>
              </div>
              <p className="font-semibold leading-relaxed">{question.statement}</p>
              <ul className="space-y-2 text-sm">
                {questionOptions.map((option) => {
                  const isSelected = selected === option;
                  const isCorrectOption = correct === option;
                  return (
                    <li
                      key={option}
                      className={
                        isCorrectOption
                          ? "rounded border border-emerald-200 bg-emerald-50 p-2"
                          : isSelected
                            ? "rounded border border-red-200 bg-red-50 p-2"
                            : "rounded border p-2"
                      }
                    >
                      <span className="font-semibold">{option}) </span>
                      {getQuestionOptionText(question, option)}
                    </li>
                  );
                })}
              </ul>
              <p className="text-sm">
                Marcada: <span className="font-semibold">{selected}</span> | Correta: <span className="font-semibold">{correct}</span>
              </p>
              {!isRight && (
                <div className="rounded border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
                  <p className="font-semibold">Explicacao</p>
                  <p className="mt-1 whitespace-pre-wrap">{question.explanation || "Nenhuma explicacao cadastrada para esta questao."}</p>
                </div>
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
}
