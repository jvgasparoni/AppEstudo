import ExamManager from "@/components/ExamManager";
import { CLAVIS_ORIGIN } from "@/lib/clavis";
import { getDomainCounts } from "@/lib/domains";
import { prisma } from "@/lib/prisma";

export default async function Exams() {
  const questions = await prisma.question.findMany({
    where: { origin: { not: CLAVIS_ORIGIN } },
    select: {
      subject: true,
    },
  });

  const domains = getDomainCounts(questions, { mainOnly: true });
  const totalDomainQuestions = domains.reduce((sum, domain) => sum + domain.count, 0);

  return (
    <div className="space-y-4">
      <div className="card">
        <p className="text-sm text-slate-500">Gerir Simulados</p>
        <h2 className="text-xl font-semibold">Criar novo simulado</h2>
        <p className="text-sm text-slate-600">Use a proporcao da prova Security+ ou monte um simulado por dominio.</p>
      </div>
      <ExamManager domains={domains} totalQuestions={totalDomainQuestions} />
    </div>
  );
}
