"use client";

import { useState } from "react";

type PreviewItem = {
  index: number;
  errors: string[];
  parsed?: {
    statement: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    optionE: string;
    correctOption: string;
    subject: string;
    theme: string;
    difficulty: string;
  };
};

const PREVIEW_LIMIT = 50;

export default function ImportPage() {
  const [payload, setPayload] = useState("");
  const [items, setItems] = useState<PreviewItem[]>([]);
  const [msg, setMsg] = useState("");
  const hasErrors = items.some((i) => i.errors.length > 0);
  const visibleItems = items.slice(0, PREVIEW_LIMIT);

  async function preview() {
    setMsg("Validando...");
    const res = await fetch("/api/questions/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "preview", payload }),
    });
    const data = await res.json();
    setItems(data.items || []);
    setMsg(data.total ? `${data.total} questao(oes) identificada(s).` : "Nenhuma questao identificada.");
  }

  async function save() {
    const res = await fetch("/api/questions/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "save", payload }),
    });
    const data = await res.json();
    if (!res.ok) return setMsg(data.message || "Erro ao importar");
    setMsg(`Importacao concluida: ${data.imported} questao(oes).`);
    setPayload("");
    setItems([]);
  }

  async function deleteAllQuestions() {
    const confirmation = window.prompt("Digite DELETE_ALL para apagar todas as questoes, tentativas e simulados vinculados.");
    if (confirmation !== "DELETE_ALL") {
      setMsg("Exclusao cancelada.");
      return;
    }

    setMsg("Apagando questoes...");
    const res = await fetch("/api/questions/import?confirm=DELETE_ALL", { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) return setMsg(data.message || "Erro ao apagar questoes");

    setPayload("");
    setItems([]);
    setMsg(`Foram apagadas ${data.deleted} questao(oes).`);
  }

  return (
    <div className="space-y-4">
      <div className="card whitespace-pre-wrap text-sm">{`Formato esperado:
Enunciado:
...

A) ...
B) ...
C) ...
D) ...
E) ...

Resposta correta: C
Explicacao:
...

Materia: ...
Tema: ...
Dificuldade: facil|medio|dificil
Tags: opcional`}</div>

      <textarea
        value={payload}
        onChange={(e) => setPayload(e.target.value)}
        className="input h-64"
        placeholder="Cole varias questoes em sequencia..."
      />

      <div className="flex flex-wrap gap-2">
        <button className="btn-primary" type="button" onClick={preview}>
          Validar e gerar previa
        </button>
        <button className="btn border" type="button" onClick={save} disabled={!items.length || hasErrors}>
          Salvar validas
        </button>
        <button className="btn border border-red-200 bg-red-50 text-red-700 hover:bg-red-100" type="button" onClick={deleteAllQuestions}>
          Apagar todas
        </button>
      </div>

      {msg && <p className="text-sm">{msg}</p>}

      {!!items.length && (
        <div className="space-y-2">
          {items.length > PREVIEW_LIMIT && (
            <div className="card text-sm text-slate-600">
              Mostrando as primeiras {PREVIEW_LIMIT} de {items.length} questoes identificadas para manter a tela leve.
            </div>
          )}

          {visibleItems.map((item) => (
            <div key={item.index} className="card">
              <p className="font-semibold">Questao #{item.index}</p>
              {item.errors.length > 0 ? (
                <ul className="ml-6 list-disc text-red-600">
                  {item.errors.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm">
                  <p>{item.parsed?.statement}</p>
                  <ul className="mt-2 space-y-1">
                    <li>A) {item.parsed?.optionA}</li>
                    <li>B) {item.parsed?.optionB}</li>
                    <li>C) {item.parsed?.optionC}</li>
                    <li>D) {item.parsed?.optionD}</li>
                    <li>E) {item.parsed?.optionE}</li>
                  </ul>
                  <p className="mt-2">
                    Resposta: {item.parsed?.correctOption} | {item.parsed?.subject} / {item.parsed?.theme} / {item.parsed?.difficulty}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
