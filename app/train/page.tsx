import { getDomainCounts, getQuestionDomain } from "@/lib/domains";
import { pickLeastAttemptedQuestion } from "@/lib/practice";
import { prisma } from "@/lib/prisma";
import { getQuestionOptionText, questionDifficultyLabels, questionOptions } from "@/lib/questions";
import Link from "next/link";

type TrainSearchParams = {
  domain?: string;
  result?: string;
  correct?: string;
  answer?: string;
  reviewQuestionId?: string;
};

function trainHref(domain: string) {
  return domain === "all" ? "/train?domain=all" : `/train?domain=${encodeURIComponent(domain)}`;
}

export default async function Train({ searchParams }: { searchParams: TrainSearchParams }) {
  const selectedDomain = searchParams.domain || "all";
  const readyQuestions = await prisma.question.findMany({
    where: {
      statement: { not: "" },
      optionA: { not: "" },
      optionB: { not: "" },
      optionC: { not: "" },
      optionD: { not: "" },
      optionE: { not: "" },
      correctOption: { in: ["A", "B", "C", "D", "E"] },
    },
    include: {
      _count: {
        select: { attempts: true },
      },
    },
  });

  const domains = getDomainCounts(readyQuestions);
  const filteredQuestions = selectedDomain === "all" ? readyQuestions : readyQuestions.filter((question) => getQuestionDomain(question) === selectedDomain);
  const question = pickLeastAttemptedQuestion(filteredQuestions);

  const wasCorrect = searchParams.result === "correct";
  const wasWrong = searchParams.result === "wrong";
  const reviewQuestionId = Number(searchParams.reviewQuestionId);
  const reviewQuestion = Number.isInteger(reviewQuestionId) ? await prisma.question.findUnique({ where: { id: reviewQuestionId } }) : null;
  const showFeedback = (wasCorrect || wasWrong) && reviewQuestion;

  return (
    <div className="space-y-4">
      <section className="card space-y-3">
        <div>
          <p className="font-semibold">Praticar</p>
          <p className="text-sm text-slate-600">Escolha um dominio ou pratique com questoes misturadas de todos os dominios.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link className={selectedDomain === "all" ? "rounded border border-blue-600 bg-blue-600 px-3 py-2 text-sm font-medium text-white" : "rounded border bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"} href={trainHref("all")}>
            Todos os dominios
          </Link>
          {domains.map((domain) => (
            <Link
              key={domain.name}
              className={
                selectedDomain === domain.name
                  ? "rounded border border-blue-600 bg-blue-600 px-3 py-2 text-sm font-medium text-white"
                  : "rounded border bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
              }
              href={trainHref(domain.name)}
            >
              {domain.name} ({domain.count})
            </Link>
          ))}
        </div>
      </section>

      {showFeedback && (
        <section className={wasCorrect ? "card border border-emerald-200 bg-emerald-50" : "card border border-red-200 bg-red-50"}>
          <p className={wasCorrect ? "font-semibold text-emerald-800" : "font-semibold text-red-800"}>
            {wasCorrect ? "Resposta correta." : "Resposta incorreta."}
          </p>
          <p className="mt-2 text-sm">
            Voce marcou: <span className="font-semibold">{searchParams.answer || "-"}</span> | Correta:{" "}
            <span className="font-semibold">{searchParams.correct || reviewQuestion.correctOption}</span>
          </p>
          {wasWrong && (
            <div className="mt-3 rounded border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
              <p className="font-semibold">Explicacao</p>
              <p className="mt-1 whitespace-pre-wrap">{reviewQuestion.explanation || "Nenhuma explicacao cadastrada para esta questao."}</p>
            </div>
          )}
          <Link className="btn-primary mt-3 inline-block" href={trainHref(selectedDomain)}>
            Proxima questao
          </Link>
        </section>
      )}

      {!showFeedback && !question && (
        <div className="card space-y-3">
          <p className="font-semibold">Sem questoes prontas para este filtro.</p>
          <p className="text-sm text-slate-600">Cadastre ou importe questoes com enunciado, alternativas A-E e resposta correta.</p>
          <Link className="btn-primary inline-block" href="/questions/new">
            Criar questao
          </Link>
        </div>
      )}

      {!showFeedback && question && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
          <form action="/api/train-attempts" method="post" className="card space-y-4">
            <input type="hidden" name="questionId" value={question.id} />
            <input type="hidden" name="domain" value={selectedDomain} />

            <div className="flex flex-wrap gap-2 text-xs text-slate-600">
              <span className="rounded border px-2 py-1">{question.subject || "Sem materia"}</span>
              <span className="rounded border px-2 py-1">{getQuestionDomain(question)}</span>
              <span className="rounded border px-2 py-1">{questionDifficultyLabels[question.difficulty as keyof typeof questionDifficultyLabels] || question.difficulty}</span>
            </div>

            <p className="text-lg font-semibold leading-relaxed">{question.statement}</p>

            <fieldset className="space-y-2">
              {questionOptions.map((key) => (
                <label key={key} className="flex cursor-pointer gap-3 rounded border p-3 hover:bg-slate-50">
                  <input className="mt-1" type="radio" name="selectedOption" value={key} required />
                  <span>
                    <span className="font-semibold">{key}) </span>
                    {getQuestionOptionText(question, key)}
                  </span>
                </label>
              ))}
            </fieldset>

            <button className="btn-primary">Responder</button>
          </form>

          <aside className="space-y-3">
            <div className="card">
              <p className="text-sm text-slate-500">Tentativas nesta questao</p>
              <p className="text-2xl font-bold">{question._count.attempts}</p>
            </div>
            <div className="card text-sm text-slate-600">
              <p className="font-semibold text-slate-900">Modo pratica</p>
              <p className="mt-1">As questoes menos treinadas aparecem primeiro dentro do filtro selecionado.</p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
