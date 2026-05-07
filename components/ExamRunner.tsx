"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Question = {
  id: number;
  statement: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  optionE: string;
  theme: string;
  domain: string;
};

const options = ["A", "B", "C", "D", "E"] as const;

function optionText(question: Question, option: (typeof options)[number]) {
  return question[`option${option}`];
}

export default function ExamRunner({ examId, title, questions }: { examId: number; title: string; questions: Question[] }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (Object.keys(answers).length !== questions.length) {
      setMessage("Responda todas as questoes antes de finalizar.");
      return;
    }

    setSubmitting(true);
    setMessage("");
    const res = await fetch(`/api/exams/${examId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        answers: Object.entries(answers).map(([questionId, selectedOption]) => ({ questionId: Number(questionId), selectedOption })),
      }),
    });
    const data = await res.json().catch(() => ({}));
    setSubmitting(false);

    if (!res.ok) {
      setMessage(data.message || "Nao foi possivel finalizar o simulado.");
      return;
    }

    router.push(`/exams/${examId}/review`);
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <p className="text-sm text-slate-500">Simulado</p>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm text-slate-600">
          {Object.keys(answers).length}/{questions.length} respondidas
        </p>
      </div>

      {questions.map((question, index) => (
        <article key={question.id} className="card space-y-3">
          <div className="flex flex-wrap gap-2 text-xs text-slate-600">
            <span className="rounded border px-2 py-1">Questao {index + 1}</span>
            <span className="rounded border px-2 py-1">{question.domain}</span>
          </div>
          <p className="font-semibold leading-relaxed">{question.statement}</p>
          <fieldset className="space-y-2">
            {options.map((option) => (
              <label key={option} className="flex cursor-pointer gap-3 rounded border p-3 hover:bg-slate-50">
                <input
                  className="mt-1"
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={answers[question.id] === option}
                  onChange={() => setAnswers((current) => ({ ...current, [question.id]: option }))}
                />
                <span>
                  <span className="font-semibold">{option}) </span>
                  {optionText(question, option)}
                </span>
              </label>
            ))}
          </fieldset>
        </article>
      ))}

      <div className="sticky bottom-0 rounded border bg-white p-3 shadow">
        <div className="flex flex-wrap items-center gap-3">
          <button className="btn-primary" type="button" disabled={submitting} onClick={submit}>
            {submitting ? "Finalizando..." : "Finalizar simulado"}
          </button>
          {message && <p className="text-sm text-red-700">{message}</p>}
        </div>
      </div>
    </div>
  );
}
