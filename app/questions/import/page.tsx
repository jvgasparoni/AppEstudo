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

export default function ImportPage() {
  const [payload, setPayload] = useState("");
  const [items, setItems] = useState<PreviewItem[]>([]);
  const [msg, setMsg] = useState("");
  const hasErrors = items.some((i) => i.errors.length > 0);

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

      <div className="flex gap-2">
        <button className="btn-primary" type="button" onClick={preview}>
          Validar e gerar previa
        </button>
        <button className="btn border" type="button" onClick={save} disabled={!items.length || hasErrors}>
          Salvar validas
        </button>
      </div>

      {msg && <p className="text-sm">{msg}</p>}

      {!!items.length && (
        <div className="space-y-2">
          {items.map((item) => (
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
