import QuestionForm from "@/components/QuestionForm";

export default function NewQuestion() {
  return <QuestionForm action="/api/questions" submitLabel="Salvar questao" />;
}
