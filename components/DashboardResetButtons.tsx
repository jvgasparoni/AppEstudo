"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function DashboardResetButtons() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [resetting, setResetting] = useState<"answered" | "accuracy" | null>(null);
  const [isPending, startTransition] = useTransition();

  async function reset(kind: "answered" | "accuracy") {
    const label = kind === "answered" ? "respondidas atuais" : "acerto atual";
    if (!window.confirm(`Resetar ${label}? O historico geral sera mantido.`)) return;

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
        <p className="font-semibold">Resets do contador atual</p>
        <p className="text-sm text-slate-600">Os totais de todos os tempos continuam preservados.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          className="btn border bg-white disabled:opacity-60"
          type="button"
          disabled={resetting === "answered" || isPending}
          onClick={() => reset("answered")}
        >
          {resetting === "answered" ? "Resetando..." : "Resetar respondidas"}
        </button>
        <button
          className="btn border bg-white disabled:opacity-60"
          type="button"
          disabled={resetting === "accuracy" || isPending}
          onClick={() => reset("accuracy")}
        >
          {resetting === "accuracy" ? "Resetando..." : "Resetar acerto"}
        </button>
      </div>
      {message && <p className="text-sm text-slate-700">{message}</p>}
    </div>
  );
}
