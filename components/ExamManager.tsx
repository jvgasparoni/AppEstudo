"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { getExamBlueprintCounts } from "@/lib/domains";

type Domain = {
  id: string;
  name: string;
  count: number;
};

export default function ExamManager({ domains, totalQuestions }: { domains: Domain[]; totalQuestions: number }) {
  const router = useRouter();
  const [examAmount, setExamAmount] = useState(Math.min(90, Math.max(totalQuestions, 1)));
  const [domainAmounts, setDomainAmounts] = useState<Record<string, number>>({});
  const [message, setMessage] = useState("");
  const [creating, setCreating] = useState<"exam" | "custom" | null>(null);

  const customTotal = useMemo(() => Object.values(domainAmounts).reduce((sum, value) => sum + (Number(value) || 0), 0), [domainAmounts]);
  const examBlueprint = useMemo(() => getExamBlueprintCounts(examAmount), [examAmount]);

  async function createExam(payload: unknown, kind: "exam" | "custom") {
    setCreating(kind);
    setMessage("");
    const res = await fetch("/api/exams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    setCreating(null);

    if (!res.ok) {
      setMessage(data.message || "Nao foi possivel criar o simulado.");
      return;
    }

    router.push(`/exams/${data.examId}`);
  }

  function createExamBlueprint() {
    createExam({ mode: "examBlueprint", amount: examAmount }, "exam");
  }

  function createCustom() {
    const domainsPayload = Object.entries(domainAmounts)
      .map(([domainId, amount]) => ({ domainId, amount: Number(amount) || 0 }))
      .filter((item) => item.amount > 0);

    createExam({ mode: "custom", domains: domainsPayload }, "custom");
  }

  return (
    <div className="space-y-4">
      <section className="card space-y-3">
        <div>
          <p className="font-semibold">Simulado prova</p>
          <p className="text-sm text-slate-600">Segue a proporcao da CompTIA Security+: 12%, 22%, 18%, 28% e 20% nos dominios 1 a 5.</p>
        </div>
        <label className="block max-w-xs">
          <span className="text-sm font-medium text-slate-700">Quantidade</span>
          <input
            className="input mt-1"
            min={1}
            max={Math.max(totalQuestions, 1)}
            type="number"
            value={examAmount}
            onChange={(event) => setExamAmount(Number(event.target.value))}
          />
        </label>
        <div className="grid gap-2 text-sm md:grid-cols-5">
          {examBlueprint.map((domain) => (
            <div key={domain.domain} className="rounded border p-2">
              <p className="font-medium">{domain.domain}</p>
              <p className="text-slate-600">{domain.amount} questao(oes)</p>
              <p className="text-xs text-slate-500">{domain.percentage}%</p>
            </div>
          ))}
        </div>
        <button className="btn-primary" type="button" disabled={creating === "exam" || totalQuestions === 0} onClick={createExamBlueprint}>
          {creating === "exam" ? "Criando..." : "Criar simulado prova"}
        </button>
      </section>

      <section className="card space-y-3">
        <div>
          <p className="font-semibold">Simulado personalizado por dominio</p>
          <p className="text-sm text-slate-600">Defina quantas questoes deseja de cada dominio disponivel.</p>
        </div>

        {domains.length === 0 ? (
          <p className="text-sm text-slate-600">Nenhum dominio encontrado no banco de questoes.</p>
        ) : (
          <div className="space-y-2">
            {domains.map((domain) => (
              <label key={domain.name} className="grid gap-2 rounded border p-3 md:grid-cols-[1fr_160px] md:items-center">
                <span>
                  <span className="font-medium">{domain.name}</span>
                  <span className="block text-sm text-slate-500">{domain.count} questao(oes) disponivel(is)</span>
                </span>
                <input
                  className="input"
                  min={0}
                  max={domain.count}
                  type="number"
                  value={domainAmounts[domain.id] ?? 0}
                  onChange={(event) => setDomainAmounts((current) => ({ ...current, [domain.id]: Number(event.target.value) }))}
                />
              </label>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium">Total: {customTotal} questao(oes)</span>
          <button className="btn-primary" type="button" disabled={creating === "custom" || customTotal === 0} onClick={createCustom}>
            {creating === "custom" ? "Criando..." : "Criar simulado personalizado"}
          </button>
        </div>
      </section>

      {message && <p className="card text-sm text-red-700">{message}</p>}
    </div>
  );
}
