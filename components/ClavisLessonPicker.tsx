"use client";

import { clavisLessonLabel, clavisLessons } from "@/lib/clavis";
import Link from "next/link";

export default function ClavisLessonPicker({
  counts = {},
  selectedLesson,
}: {
  counts?: Record<number, number>;
  selectedLesson?: number | null;
}) {
  return (
    <div className="space-y-2">
      <label className="block max-w-xs">
        <span className="text-sm font-medium text-slate-700">Escolha a aula</span>
        <select
          className="input mt-1"
          value={selectedLesson || ""}
          onChange={(event) => {
            if (event.target.value) window.location.href = `/train?mode=clavis&lesson=${event.target.value}`;
          }}
        >
          <option value="">Selecione</option>
          {clavisLessons.map((lesson) => (
            <option key={lesson} value={lesson}>
              {clavisLessonLabel(lesson)}
              {counts[lesson] ? ` (${counts[lesson]})` : ""}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
        {clavisLessons.map((lesson) => {
          const active = selectedLesson === lesson;
          return (
            <Link
              key={lesson}
              className={
                active
                  ? "rounded border border-blue-600 bg-blue-600 px-2 py-2 text-center text-sm font-medium text-white"
                  : "rounded border bg-white px-2 py-2 text-center text-sm font-medium hover:bg-slate-50"
              }
              href={`/train?mode=clavis&lesson=${lesson}`}
            >
              {lesson}
              {counts[lesson] ? <span className="ml-1 text-xs opacity-80">({counts[lesson]})</span> : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
