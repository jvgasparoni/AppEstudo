import ExamHistoryActions from "@/components/ExamHistoryActions";
import { getExamStats } from "@/lib/exam-results";
import { prisma } from "@/lib/prisma";

export default async function ExamHistoryPage() {
  const exams = await prisma.exam.findMany({
    where: {
      attempts: { some: { mode: "EXAM" } },
    },
    orderBy: { createdAt: "desc" },
    include: {
      examQuestions: true,
      attempts: {
        where: { mode: "EXAM" },
        include: { question: true },
      },
    },
  });

  return (
    <div className="space-y-4">
      <div className="card">
        <p className="text-sm text-slate-500">Simulados Realizados</p>
        <h2 className="text-xl font-semibold">Historico de simulados concluidos</h2>
      </div>

      {exams.length === 0 ? (
        <div className="card text-sm text-slate-600">Nenhum simulado concluido ainda.</div>
      ) : (
        <div className="space-y-3">
          {exams.map((exam) => {
            const stats = getExamStats(exam);
            return (
              <article key={exam.id} className="card">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-semibold">{exam.title || `Simulado #${exam.id}`}</p>
                    <p className="text-sm text-slate-600">
                      Realizado em {stats.completedAt ? stats.completedAt.toLocaleString("pt-BR") : "-"} | {stats.total} questao(oes) | {stats.percentage}% de acerto
                    </p>
                  </div>
                  <ExamHistoryActions examId={exam.id} />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
