import ExamManager from "@/components/ExamManager";
import { getQuestionDomain, sortDomains } from "@/lib/domains";
import { prisma } from "@/lib/prisma";

export default async function Exams() {
  const questions = await prisma.question.findMany({
    select: {
      theme: true,
      tags: true,
    },
  });

  const counts = new Map<string, number>();
  for (const question of questions) {
    const domain = getQuestionDomain(question);
    counts.set(domain, (counts.get(domain) || 0) + 1);
  }

  const domains = Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort(sortDomains);

  return (
    <div className="space-y-4">
      <div className="card">
        <p className="text-sm text-slate-500">Gerir Simulados</p>
        <h2 className="text-xl font-semibold">Criar novo simulado</h2>
        <p className="text-sm text-slate-600">Use a proporcao da prova Security+ ou monte um simulado por dominio.</p>
      </div>
      <ExamManager domains={domains} totalQuestions={questions.length} />
    </div>
  );
}
