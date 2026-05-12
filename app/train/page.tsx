import ClavisLessonPicker from "@/components/ClavisLessonPicker";
import { CLAVIS_ORIGIN, normalizeClavisLesson } from "@/lib/clavis";
import { getDomainCounts, getDomainIdFromValue, getQuestionDomain, getQuestionDomainInfo, getQuestionTopic, getTopicCounts } from "@/lib/domains";
import { pickLeastAttemptedQuestion } from "@/lib/practice";
import { prisma } from "@/lib/prisma";
import { getQuestionOptionText, questionDifficultyLabels, questionOptions } from "@/lib/questions";
import Link from "next/link";

type TrainSearchParams = {
  domain?: string;
  topic?: string;
  mode?: string;
  lesson?: string;
  result?: string;
  correct?: string;
  answer?: string;
  reviewQuestionId?: string;
};

function trainHref(domain: string, topic = "all") {
  const params = new URLSearchParams();
  params.set("domain", domain || "all");
  if (topic !== "all") params.set("topic", topic);
  return `/train?${params.toString()}`;
}

function clavisTrainHref(lesson: number) {
  return `/train?mode=clavis&lesson=${lesson}`;
}

export default async function Train({ searchParams }: { searchParams: TrainSearchParams }) {
  const isClavisMode = searchParams.mode === "clavis";
  const selectedLesson = normalizeClavisLesson(searchParams.lesson);
  const selectedDomain = searchParams.domain || "all";
  const selectedTopic = searchParams.topic || "all";
  const baseReadyWhere = {
    statement: { not: "" },
    optionA: { not: "" },
    optionB: { not: "" },
    optionC: { not: "" },
    optionD: { not: "" },
    optionE: { not: "" },
    correctOption: { in: ["A", "B", "C", "D", "E"] },
  };

  let clavisLessonCounts: Record<number, number> = {};
  if (isClavisMode) {
    const clavisCountsRaw = await prisma.question.groupBy({
      by: ["lessonNumber"],
      where: {
        origin: CLAVIS_ORIGIN,
        lessonNumber: { not: null },
      },
      _count: { _all: true },
    });

    clavisLessonCounts = clavisCountsRaw.reduce<Record<number, number>>((acc, item) => {
      if (item.lessonNumber) acc[item.lessonNumber] = item._count._all;
      return acc;
    }, {});
  }

  const readyQuestions =
    isClavisMode && !selectedLesson
      ? []
      : await prisma.question.findMany({
          where: {
            ...baseReadyWhere,
            ...(isClavisMode ? { origin: CLAVIS_ORIGIN, lessonNumber: selectedLesson } : { origin: { not: CLAVIS_ORIGIN } }),
          },
          include: {
            _count: {
              select: { attempts: true },
            },
          },
        });

  const domains = isClavisMode ? [] : getDomainCounts(readyQuestions, { mainOnly: true });
  const selectedDomainId = selectedDomain === "all" ? "all" : getDomainIdFromValue(selectedDomain);
  const domainFilteredQuestions = isClavisMode
    ? readyQuestions
    : selectedDomain === "all"
      ? readyQuestions
      : readyQuestions.filter((question) => getQuestionDomainInfo(question).id === selectedDomainId);
  const topics = isClavisMode ? [] : getTopicCounts(domainFilteredQuestions);
  const topicFilteredQuestions =
    !isClavisMode && selectedTopic !== "all"
      ? domainFilteredQuestions.filter((question) => getQuestionTopic(question) === selectedTopic)
      : domainFilteredQuestions;
  const question = pickLeastAttemptedQuestion(topicFilteredQuestions);

  const wasCorrect = searchParams.result === "correct";
  const wasWrong = searchParams.result === "wrong";
  const reviewQuestionId = Number(searchParams.reviewQuestionId);
  const reviewQuestion = Number.isInteger(reviewQuestionId) ? await prisma.question.findUnique({ where: { id: reviewQuestionId } }) : null;
  const showFeedback = (wasCorrect || wasWrong) && reviewQuestion;
  const nextQuestionHref = isClavisMode && selectedLesson ? clavisTrainHref(selectedLesson) : trainHref(selectedDomain, selectedTopic);

  return (
    <div className="space-y-4">
      {isClavisMode ? (
        <section className="card space-y-3">
          <p className="font-semibold">Praticar Clavis</p>
          <ClavisLessonPicker counts={clavisLessonCounts} selectedLesson={selectedLesson} />
        </section>
      ) : (
        <section className="card space-y-3">
          <div>
            <p className="font-semibold">Praticar</p>
            <p className="text-sm text-slate-600">Escolha um dominio pela materia, e opcionalmente filtre por tema.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link className={selectedDomain === "all" ? "rounded border border-blue-600 bg-blue-600 px-3 py-2 text-sm font-medium text-white" : "rounded border bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"} href={trainHref("all", selectedTopic)}>
              Todos os dominios
            </Link>
            {domains.map((domain) => (
              <Link
                key={domain.id}
                className={
                  selectedDomainId === domain.id
                    ? "rounded border border-blue-600 bg-blue-600 px-3 py-2 text-sm font-medium text-white"
                    : "rounded border bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
                }
                href={trainHref(domain.id, selectedTopic)}
              >
                {domain.name} ({domain.count})
              </Link>
            ))}
          </div>
          <form className="flex max-w-xl flex-col gap-2 sm:flex-row sm:items-end">
            <input type="hidden" name="domain" value={selectedDomain} />
            <label className="flex-1">
              <span className="text-sm font-medium text-slate-700">Filtrar por tema</span>
              <select className="input mt-1" name="topic" defaultValue={selectedTopic}>
                <option value="all">Todos os temas</option>
                {topics.map((topic) => (
                  <option key={topic.name} value={topic.name}>
                    {topic.name} ({topic.count})
                  </option>
                ))}
              </select>
            </label>
            <button className="btn border bg-white">Aplicar tema</button>
          </form>
        </section>
      )}

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
          <Link className="btn-primary mt-3 inline-block" href={nextQuestionHref}>
            Proxima questao
          </Link>
        </section>
      )}

      {isClavisMode && !selectedLesson && <div className="card text-sm text-slate-600">Escolha uma aula entre 1 e 57 para iniciar.</div>}

      {!showFeedback && (!isClavisMode || selectedLesson) && !question && (
        <div className="card space-y-3">
          <p className="font-semibold">{isClavisMode ? `Sem questoes para a aula ${selectedLesson}.` : "Sem questoes prontas para este filtro."}</p>
          <p className="text-sm text-slate-600">
            {isClavisMode
              ? "Importe questoes Clavis para esta aula antes de praticar."
              : "Cadastre ou importe questoes com enunciado, alternativas A-E e resposta correta."}
          </p>
          <Link className="btn-primary inline-block" href={isClavisMode ? "/questions" : "/questions/new"}>
            {isClavisMode ? "Importar Clavis" : "Criar questao"}
          </Link>
        </div>
      )}

      {!showFeedback && question && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
          <form action="/api/train-attempts" method="post" className="card space-y-4">
            <input type="hidden" name="questionId" value={question.id} />
            <input type="hidden" name="domain" value={selectedDomain} />
            <input type="hidden" name="topic" value={selectedTopic} />
            <input type="hidden" name="mode" value={isClavisMode ? "clavis" : "general"} />
            {selectedLesson && <input type="hidden" name="lesson" value={selectedLesson} />}

            <div className="flex flex-wrap gap-2 text-xs text-slate-600">
              <span className="rounded border px-2 py-1">{question.subject || "Sem materia"}</span>
              <span className="rounded border px-2 py-1">{isClavisMode && selectedLesson ? `Aula ${selectedLesson}` : getQuestionDomain(question)}</span>
              {!isClavisMode && <span className="rounded border px-2 py-1">Tema: {getQuestionTopic(question)}</span>}
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
