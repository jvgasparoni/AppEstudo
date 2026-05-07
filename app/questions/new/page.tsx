const fields = [
  { name: "statement", label: "Enunciado", span: "md:col-span-2", required: true },
  { name: "optionA", label: "Alternativa A", required: true },
  { name: "optionB", label: "Alternativa B", required: true },
  { name: "optionC", label: "Alternativa C", required: true },
  { name: "optionD", label: "Alternativa D", required: true },
  { name: "optionE", label: "Alternativa E", required: true },
  { name: "explanation", label: "Explicacao", span: "md:col-span-2", required: true },
  { name: "subject", label: "Materia", required: true },
  { name: "theme", label: "Tema", required: true },
  { name: "subtheme", label: "Subtema" },
  { name: "tags", label: "Tags" },
  { name: "source", label: "Fonte", span: "md:col-span-2" },
];

export default function NewQuestion() {
  return (
    <form action="/api/questions" method="post" className="card grid gap-3 md:grid-cols-2">
      {fields.map((field) => (
        <label key={field.name} className={field.span || ""}>
          <span className="text-sm font-medium text-slate-700">{field.label}</span>
          <input name={field.name} required={field.required} placeholder={field.label} className="input mt-1" />
        </label>
      ))}

      <label>
        <span className="text-sm font-medium text-slate-700">Resposta correta</span>
        <select name="correctOption" className="input mt-1" required defaultValue="">
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
        <select name="difficulty" className="input mt-1" defaultValue="MEDIUM">
          <option value="EASY">Facil</option>
          <option value="MEDIUM">Medio</option>
          <option value="HARD">Dificil</option>
        </select>
      </label>

      <div className="md:col-span-2">
        <button className="btn-primary">Salvar questao</button>
      </div>
    </form>
  );
}
