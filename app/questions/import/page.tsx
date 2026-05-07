"use client";

import { useState } from "react";

type PreviewItem = {
  index: number;
  errors: string[];
  parsed?: {
    statement: string;
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
    setMsg(data.total ? `${data.total} questão(ões) identificada(s).` : "Nenhuma questão identificada.");
  }

  async function save() {
    const res = await fetch("/api/questions/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "save", payload }),
    });
    const data = await res.json();
    if (!res.ok) return setMsg(data.message || "Erro ao importar");
    setMsg(`Importação concluída: ${data.imported} questão(ões).`);
    setPayload("");
    setItems([]);
  }

  return (
    <div className="space-y-4">
      <div className="card text-sm whitespace-pre-wrap">{`Formato esperado:
Enunciado:
...

A) ...
B) ...
C) ...
D) ...
E) ...

Resposta correta: C
Explicação:
...

Matéria: ...
Tema: ...
Dificuldade: fácil|médio|difícil
Tags: opcional`}</div>

      <textarea
        value={payload}
        onChange={(e) => setPayload(e.target.value)}
        className="input h-64"
        placeholder="Cole várias questões em sequência..."
      />

      <div className="flex gap-2">
        <button className="btn-primary" type="button" onClick={preview}>Validar e gerar prévia</button>
        <button className="btn border" type="button" onClick={save} disabled={!items.length || hasErrors}>Salvar válidas</button>
      </div>

      {msg && <p className="text-sm">{msg}</p>}

      {!!items.length && (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.index} className="card">
              <p className="font-semibold">Questão #{item.index}</p>
              {item.errors.length > 0 ? (
                <ul className="text-red-600 list-disc ml-6">
                  {item.errors.map((e) => <li key={e}>{e}</li>)}
                </ul>
              ) : (
                <div className="text-sm">
                  <p>{item.parsed?.statement}</p>
                  <p>Resposta: {item.parsed?.correctOption} | {item.parsed?.subject} / {item.parsed?.theme} / {item.parsed?.difficulty}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
