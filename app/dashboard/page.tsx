import DashboardResetButtons from "@/components/DashboardResetButtons";
import { prisma } from "@/lib/prisma";
import { DashboardPeriod, DashboardSource, getDashboard, normalizeDashboardPeriod, normalizeDashboardSource } from "@/lib/stats";
import Link from "next/link";

const periodOptions: Array<{ value: DashboardPeriod; label: string }> = [
  { value: "7", label: "7 dias" },
  { value: "15", label: "15 dias" },
  { value: "30", label: "30 dias" },
  { value: "all", label: "Desde sempre" },
];
const sourceOptions: Array<{ value: DashboardSource; label: string }> = [
  { value: "all", label: "Tudo" },
  { value: "exam", label: "Simulados" },
  { value: "train", label: "Praticar" },
];

function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="card">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function dashboardHref(period: DashboardPeriod, source: DashboardSource) {
  return `/dashboard?period=${period}&source=${source}`;
}

export default async function Dashboard({ searchParams }: { searchParams: { period?: string; source?: string } }) {
  const selectedPeriod = normalizeDashboardPeriod(searchParams.period);
  const selectedSource = normalizeDashboardSource(searchParams.source);
  const d = await getDashboard(selectedPeriod, selectedSource);
  const pendingFlashcards = await prisma.flashcard.count({ where: { nextReview: { lte: new Date() } } });

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Questoes" value={d.q} />
        <StatCard label="Flashcards" value={d.f} />
        <StatCard label="Pendentes hoje" value={pendingFlashcards} />
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Geral</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Respondidas geral" value={d.allTimeAccuracy.total} hint="Desde o ultimo reset de acerto geral" />
          <StatCard label="Acertos geral" value={d.allTimeAccuracy.correct} hint="Desde o ultimo reset de acerto geral" />
          <StatCard
            label="Acerto geral"
            value={`${d.allTimeAccuracy.rate}%`}
            hint={`${d.allTimeAccuracy.correct}/${d.allTimeAccuracy.total} desde o ultimo reset`}
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Contador atual</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Respondidas atuais" value={d.resettable.answered} hint="Desde o ultimo reset de respondidas" />
          <StatCard label="Acertos atuais" value={d.resettable.accuracyCorrect} hint="Desde o ultimo reset de acerto atual" />
          <StatCard
            label="Acerto atual"
            value={`${d.resettable.accuracyRate}%`}
            hint={`${d.resettable.accuracyCorrect}/${d.resettable.accuracyTotal} desde o ultimo reset`}
          />
          <StatCard label="Respondidas no Praticar" value={d.resettable.trainAnswered} hint="Desde o ultimo reset de Praticar" />
        </div>
      </section>

      <DashboardResetButtons />

      <section className="card space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="font-semibold">Analise por periodo</p>
            <p className="text-sm text-slate-600">Filtra as tentativas por data e origem, mostrando o desempenho por dominio e subtema.</p>
          </div>
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {periodOptions.map((option) => (
                <Link
                  key={option.value}
                  href={dashboardHref(option.value, selectedSource)}
                  className={
                    option.value === selectedPeriod
                      ? "rounded border border-blue-600 bg-blue-600 px-3 py-2 text-sm font-medium text-white"
                      : "rounded border bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
                  }
                >
                  {option.label}
                </Link>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {sourceOptions.map((option) => (
                <Link
                  key={option.value}
                  href={dashboardHref(selectedPeriod, option.value)}
                  className={
                    option.value === selectedSource
                      ? "rounded border border-emerald-600 bg-emerald-600 px-3 py-2 text-sm font-medium text-white"
                      : "rounded border bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
                  }
                >
                  {option.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <StatCard label="Respondidas no periodo" value={d.period.total} />
          <StatCard label="Acertos no periodo" value={d.period.correct} />
          <StatCard label="Acerto no periodo" value={`${d.period.rate}%`} />
        </div>

        {d.period.domainSubthemes.length === 0 ? (
          <div className="rounded border p-3 text-sm text-slate-600">Nenhuma tentativa encontrada neste periodo.</div>
        ) : (
          <div className="space-y-3">
            {d.period.domainSubthemes.map((domain) => (
              <div key={domain.domain} className="rounded border">
                <div className="grid gap-2 border-b bg-slate-50 p-3 md:grid-cols-[1fr_repeat(4,90px)]">
                  <p className="font-semibold">{domain.domain}</p>
                  <p>{domain.total} questoes</p>
                  <p>{domain.correct} acertos</p>
                  <p>{domain.wrong} erros</p>
                  <p>{domain.rate}%</p>
                </div>
                <div className="divide-y">
                  {domain.subthemes.map((subtheme) => (
                    <div key={subtheme.subtheme} className="grid gap-2 p-3 text-sm md:grid-cols-[1fr_repeat(4,90px)]">
                      <p>{subtheme.subtheme}</p>
                      <p>{subtheme.total}</p>
                      <p>{subtheme.correct}</p>
                      <p>{subtheme.wrong}</p>
                      <p>{subtheme.rate}%</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
