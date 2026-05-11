type FlashcardFormValues = {
  front?: string;
  back?: string;
  subject?: string;
  theme?: string;
  tags?: string;
};

type TextField = {
  name: keyof FlashcardFormValues;
  label: string;
  placeholder: string;
  required: boolean;
  span?: string;
};

const textFields: TextField[] = [
  { name: "front", label: "Frente", placeholder: "Pergunta ou pista", required: true },
  { name: "back", label: "Verso", placeholder: "Resposta", required: true },
  { name: "subject", label: "Materia", placeholder: "Materia", required: false },
  { name: "theme", label: "Tema", placeholder: "Tema", required: false },
  { name: "tags", label: "Tags", placeholder: "Tags", required: false, span: "md:col-span-2" },
];

export default function FlashcardForm({
  action,
  submitLabel,
  initialValues = {},
}: {
  action: string;
  submitLabel: string;
  initialValues?: FlashcardFormValues;
}) {
  return (
    <form action={action} method="post" className="card grid gap-3 md:grid-cols-2">
      {textFields.map((field) => (
        <label key={field.name} className={field.span ?? ""}>
          <span className="text-sm font-medium text-slate-700">{field.label}</span>
          <input
            name={field.name}
            className="input mt-1"
            placeholder={field.placeholder}
            required={field.required}
            defaultValue={initialValues[field.name] || ""}
          />
        </label>
      ))}
      <div className="md:col-span-2">
        <button className="btn-primary">{submitLabel}</button>
      </div>
    </form>
  );
}
