import { prisma } from "@/lib/prisma";

type TrainSearchParams = {
  result?: string;
  correct?: string;
  answer?: string;
};

const optionKeys = ["A", "B", "C", "D", "E"] as const;
const difficultyLabel: Record<string, string> = {
  EASY: "Facil",
  MEDIUM: "Medio",
  HARD: "Dificil",
};

export default async function Train({ searchParams }: { searchParams: TrainSearchParams }) {
  const question = await prisma.question.findFirst({
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
    orderBy: [{ attempts: { _count: "asc" } }, { createdAt: "desc" }],
  });

  if (!question) {
    return (
      <div className="card space-y-3">
        <p className="font-semibold">Sem questoes prontas para treino.</p>
        <p className="text-sm text-slate-600">Cadastre ou importe questoes com enunciado, alternativas A-E e resposta correta.</p>
        <a className="btn-primary inline-block" href="/questions/new">
          Criar questao
        </a>
      </div>
    );
  }

  const options = optionKeys.map((key) => ({
    key,
    text: question[`option${key}` as const],
  }));
  const wasCorrect = searchParams.result === "correct";
  const wasWrong = searchParams.result === "wrong";

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
      <form action="/api/train-attempts" method="post" className="card space-y-4">
        <input type="hidden" name="questionId" value={question.id} />

        {(wasCorrect || wasWrong) && (
          <div className={wasCorrect ? "rounded border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800" : "rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800"}>
            {wasCorrect ? "Resposta correta." : `Resposta incorreta. Correta: ${searchParams.correct || "-"}. Voce marcou: ${searchParams.answer || "-"}.`}
          </div>
        )}

        <div className="flex flex-wrap gap-2 text-xs text-slate-600">
          <span className="rounded border px-2 py-1">{question.subject || "Sem materia"}</span>
          <span className="rounded border px-2 py-1">{question.theme || "Sem tema"}</span>
          <span className="rounded border px-2 py-1">{difficultyLabel[question.difficulty] || question.difficulty}</span>
        </div>

        <p className="text-lg font-semibold leading-relaxed">{question.statement}</p>

        <fieldset className="space-y-2">
          {options.map((option) => (
            <label key={option.key} className="flex cursor-pointer gap-3 rounded border p-3 hover:bg-slate-50">
              <input className="mt-1" type="radio" name="selectedOption" value={option.key} required />
              <span>
                <span className="font-semibold">{option.key}) </span>
                {option.text}
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
          <p className="mt-1">As questoes menos treinadas aparecem primeiro, parecido com o fluxo de revisao de apps como Anki e plataformas de simulados.</p>
        </div>
      </aside>
    </div>
  );
}
