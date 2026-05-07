import DashboardResetButtons from "@/components/DashboardResetButtons";
import { prisma } from "@/lib/prisma";
import { getDashboard } from "@/lib/stats";

function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="card">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

export default async function Dashboard() {
  const d = await getDashboard();
  const pendingFlashcards = await prisma.flashcard.count({ where: { nextReview: { lte: new Date() } } });

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Questoes" value={d.q} />
        <StatCard label="Flashcards" value={d.f} />
        <StatCard label="Pendentes hoje" value={pendingFlashcards} />
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Todos os tempos</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Respondidas geral" value={d.allTime.total} />
          <StatCard label="Acertos geral" value={d.allTime.correct} />
          <StatCard label="Acerto geral" value={`${d.allTime.rate}%`} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Contador atual</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Respondidas atuais" value={d.resettable.answered} hint="Desde o ultimo reset de respondidas" />
          <StatCard label="Acertos atuais" value={d.resettable.accuracyCorrect} hint="Desde o ultimo reset de acerto" />
          <StatCard
            label="Acerto atual"
            value={`${d.resettable.accuracyRate}%`}
            hint={`${d.resettable.accuracyCorrect}/${d.resettable.accuracyTotal} desde o ultimo reset`}
          />
        </div>
      </section>

      <DashboardResetButtons />
    </div>
  );
}
