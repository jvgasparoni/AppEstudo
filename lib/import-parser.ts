export type ParsedQuestion = {
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
  difficulty: "EASY" | "MEDIUM" | "HARD";
  tags: string;
  subtheme?: string | null;
  source?: string | null;
};

export type ParseResult = {
  index: number;
  parsed?: ParsedQuestion;
  errors: string[];
  raw: string;
};

const difficultyMap: Record<string, "EASY" | "MEDIUM" | "HARD"> = {
  facil: "EASY",
  fácil: "EASY",
  easy: "EASY",
  medio: "MEDIUM",
  médio: "MEDIUM",
  medium: "MEDIUM",
  dificil: "HARD",
  difícil: "HARD",
  hard: "HARD",
};

const nextLabel = [
  "Enunciado\\s*:",
  "[A-E]\\)",
  "Resposta correta\\s*:",
  "Explicacao\\s*:",
  "Explicação\\s*:",
  "Materia\\s*:",
  "Matéria\\s*:",
  "Tema\\s*:",
  "Dificuldade\\s*:",
  "Tags\\s*:",
  "Fonte\\s*:",
  "Subtema\\s*:",
].join("|");

function normalizeKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function capture(block: string, labels: string[]) {
  for (const label of labels) {
    const r = new RegExp(`${label}\\s*:\\s*([\\s\\S]*?)(?=\\n(?:${nextLabel})|$)`, "i");
    const value = block.match(r)?.[1]?.trim();
    if (value) return value;
  }
  return "";
}

function captureOption(block: string, option: string) {
  const r = new RegExp(
    `^${option}\\)\\s*([\\s\\S]*?)(?=\\n[A-E]\\)\\s|\\nResposta correta\\s*:|\\nExplicacao\\s*:|\\nExplicaÃ§Ã£o\\s*:|\\nMateria\\s*:|\\nMatÃ©ria\\s*:|\\nTema\\s*:|\\nDificuldade\\s*:|\\nTags\\s*:|\\nFonte\\s*:|\\nSubtema\\s*:|$)`,
    "im",
  );
  return block.match(r)?.[1]?.trim() || "";
}

export function parseFreeTextQuestions(input: string): ParseResult[] {
  const blocks = input
    .split(/\n\s*\n(?=Enunciado\s*:)/gi)
    .map((s) => s.trim())
    .filter(Boolean);

  return blocks.map((block, idx) => {
    const statement = capture(block, ["Enunciado"]);
    const optionA = captureOption(block, "A");
    const optionB = captureOption(block, "B");
    const optionC = captureOption(block, "C");
    const optionD = captureOption(block, "D");
    const optionE = captureOption(block, "E");
    const correctOption = capture(block, ["Resposta correta"]).toUpperCase().replace(/[^A-E]/g, "").slice(0, 1);
    const explanation = capture(block, ["Explicacao", "Explicação"]);
    const subject = capture(block, ["Materia", "Matéria"]);
    const theme = capture(block, ["Tema"]);
    const difficultyRaw = normalizeKey(capture(block, ["Dificuldade"]));
    const tags = capture(block, ["Tags"]);
    const source = capture(block, ["Fonte"]) || null;
    const subtheme = capture(block, ["Subtema"]) || null;

    const difficulty = difficultyMap[difficultyRaw] || "MEDIUM";
    const errors: string[] = [];
    if (!statement) errors.push("Enunciado ausente");
    if (!optionA || !optionB || !optionC || !optionD || !optionE) errors.push("Alternativas A-E incompletas");
    if (!correctOption) errors.push("Resposta correta ausente");
    if (correctOption && !["A", "B", "C", "D", "E"].includes(correctOption)) errors.push("Resposta correta invalida");
    if (!explanation) errors.push("Explicacao ausente");
    if (!subject) errors.push("Materia ausente");
    if (!theme) errors.push("Tema ausente");

    const parsed: ParsedQuestion = {
      statement,
      optionA,
      optionB,
      optionC,
      optionD,
      optionE,
      correctOption,
      explanation,
      subject,
      theme,
      difficulty,
      tags,
      source,
      subtheme,
    };

    return { index: idx + 1, parsed, errors, raw: block };
  });
}
