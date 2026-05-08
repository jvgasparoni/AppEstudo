"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type ResetKind = "current" | "allTimeAccuracy" | "trainAnswered";

const labels: Record<ResetKind, string> = {
  current: "contador atual",
  allTimeAccuracy: "acerto geral",
  trainAnswered: "respondidas no Praticar",
};

export default function DashboardResetButtons() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [resetting, setResetting] = useState<ResetKind | null>(null);
  const [isPending, startTransition] = useTransition();

  async function reset(kind: ResetKind) {
    const label = labels[kind];
    if (!window.confirm(`Resetar ${label}? O historico de tentativas sera mantido.`)) return;

    setResetting(kind);
    setMessage("");
    const res = await fetch("/api/dashboard/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind }),
    });
    const data = await res.json().catch(() => ({}));
    setResetting(null);

    if (!res.ok) {
      setMessage(data.message || "Nao foi possivel resetar.");
      return;
    }

    setMessage(`${label} resetado.`);
    startTransition(() => router.refresh());
  }

  return (
    <div className="card space-y-3">
      <div>
        <p className="font-semibold">Resets de contadores</p>
        <p className="text-sm text-slate-600">Os resets mudam os contadores exibidos, mas nao apagam o historico de tentativas.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button className="btn border bg-white disabled:opacity-60" type="button" disabled={resetting === "current" || isPending} onClick={() => reset("current")}>
          {resetting === "current" ? "Resetando..." : "Resetar contador atual"}
        </button>
        <button
          className="btn border bg-white disabled:opacity-60"
          type="button"
          disabled={resetting === "trainAnswered" || isPending}
          onClick={() => reset("trainAnswered")}
        >
          {resetting === "trainAnswered" ? "Resetando..." : "Resetar respondidas no Praticar"}
        </button>
        <button
          className="btn border border-red-200 bg-red-50 text-red-700 disabled:opacity-60"
          type="button"
          disabled={resetting === "allTimeAccuracy" || isPending}
          onClick={() => reset("allTimeAccuracy")}
        >
          {resetting === "allTimeAccuracy" ? "Resetando..." : "Resetar acerto geral"}
        </button>
      </div>
      {message && <p className="text-sm text-slate-700">{message}</p>}
    </div>
  );
}
