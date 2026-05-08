export const questionOptions = ["A", "B", "C", "D", "E"] as const;
export const questionDifficulties = ["EASY", "MEDIUM", "HARD"] as const;

export type QuestionOption = (typeof questionOptions)[number];
export type QuestionDifficulty = (typeof questionDifficulties)[number];
export type QuestionOptionTextSource = Record<`option${QuestionOption}`, string>;

export const questionDifficultyLabels: Record<QuestionDifficulty, string> = {
  EASY: "Facil",
  MEDIUM: "Medio",
  HARD: "Dificil",
};

export type QuestionInput = {
  statement: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  optionE: string;
  correctOption: string;
  explanation: string;
  subject: string;
  theme: string;
  subtheme: string | null;
  difficulty: QuestionDifficulty;
  tags: string;
  source: string | null;
};

export function formText(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

export function isQuestionOption(value: string): value is QuestionOption {
  return questionOptions.includes(value as QuestionOption);
}

export function getQuestionOptionText(question: QuestionOptionTextSource, option: QuestionOption) {
  return question[`option${option}`];
}

export function normalizeDifficulty(value: string): QuestionDifficulty {
  return questionDifficulties.includes(value as QuestionDifficulty) ? (value as QuestionDifficulty) : "MEDIUM";
}

export function readQuestionFormData(formData: FormData): QuestionInput {
  return {
    statement: formText(formData, "statement"),
    optionA: formText(formData, "optionA"),
    optionB: formText(formData, "optionB"),
    optionC: formText(formData, "optionC"),
    optionD: formText(formData, "optionD"),
    optionE: formText(formData, "optionE"),
    correctOption: formText(formData, "correctOption").toUpperCase(),
    explanation: formText(formData, "explanation"),
    subject: formText(formData, "subject"),
    theme: formText(formData, "theme"),
    subtheme: formText(formData, "subtheme") || null,
    difficulty: normalizeDifficulty(formText(formData, "difficulty") || "MEDIUM"),
    tags: formText(formData, "tags"),
    source: formText(formData, "source") || null,
  };
}

export function validateQuestionInput(data: QuestionInput) {
  const required = ["statement", "optionA", "optionB", "optionC", "optionD", "optionE", "correctOption", "explanation", "subject", "theme"] as const;
  const missing = required.filter((field) => !data[field]);

  if (missing.length) return `Campos obrigatorios ausentes: ${missing.join(", ")}`;
  if (!isQuestionOption(data.correctOption)) return "Resposta correta deve ser A, B, C, D ou E";
  return null;
}
