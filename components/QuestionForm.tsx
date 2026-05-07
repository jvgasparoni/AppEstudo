type QuestionFormValues = {
  statement?: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  optionE?: string;
  correctOption?: string;
  explanation?: string;
  subject?: string;
  theme?: string;
  subtheme?: string | null;
  difficulty?: string;
  tags?: string;
  source?: string | null;
};

type TextField = {
  name: keyof QuestionFormValues;
  label: string;
  required: boolean;
  span?: string;
};

const textFields: TextField[] = [
  { name: "optionA", label: "Alternativa A", required: true },
  { name: "optionB", label: "Alternativa B", required: true },
  { name: "optionC", label: "Alternativa C", required: true },
  { name: "optionD", label: "Alternativa D", required: true },
  { name: "optionE", label: "Alternativa E", required: true },
  { name: "subject", label: "Materia", required: true },
  { name: "theme", label: "Tema", required: true },
  { name: "subtheme", label: "Subtema", required: false },
  { name: "tags", label: "Tags", required: false },
  { name: "source", label: "Fonte", required: false, span: "md:col-span-2" },
];

export default function QuestionForm({ action, submitLabel, initialValues = {} }: { action: string; submitLabel: string; initialValues?: QuestionFormValues }) {
  return (
    <form action={action} method="post" className="card grid gap-3 md:grid-cols-2">
      <label className="md:col-span-2">
        <span className="text-sm font-medium text-slate-700">Enunciado</span>
        <textarea name="statement" required placeholder="Enunciado" className="input mt-1 min-h-28" defaultValue={initialValues.statement || ""} />
      </label>

      {textFields.map((field) => (
        <label key={field.name} className={field.span ?? ""}>
          <span className="text-sm font-medium text-slate-700">{field.label}</span>
          <input
            name={field.name}
            required={field.required}
            placeholder={field.label}
            className="input mt-1"
            defaultValue={String(initialValues[field.name] || "")}
          />
        </label>
      ))}

      <label className="md:col-span-2">
        <span className="text-sm font-medium text-slate-700">Explicacao</span>
        <textarea name="explanation" required placeholder="Explicacao" className="input mt-1 min-h-24" defaultValue={initialValues.explanation || ""} />
      </label>

      <label>
        <span className="text-sm font-medium text-slate-700">Resposta correta</span>
        <select name="correctOption" className="input mt-1" required defaultValue={initialValues.correctOption || ""}>
          <option value="" disabled>
            Selecione
          </option>
          <option>A</option>
          <option>B</option>
          <option>C</option>
          <option>D</option>
          <option>E</option>
        </select>
      </label>

      <label>
        <span className="text-sm font-medium text-slate-700">Dificuldade</span>
        <select name="difficulty" className="input mt-1" defaultValue={initialValues.difficulty || "MEDIUM"}>
          <option value="EASY">Facil</option>
          <option value="MEDIUM">Medio</option>
          <option value="HARD">Dificil</option>
        </select>
      </label>

      <div className="md:col-span-2">
        <button className="btn-primary">{submitLabel}</button>
      </div>
    </form>
  );
}
