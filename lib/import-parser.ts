import { QuestionDifficulty, questionOptions } from "./questions";

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
  difficulty: QuestionDifficulty;
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

const difficultyMap: Record<string, QuestionDifficulty> = {
  facil: "EASY",
  easy: "EASY",
  medio: "MEDIUM",
  medium: "MEDIUM",
  dificil: "HARD",
  hard: "HARD",
};

const optionLabelPattern = "[A-E][\\).]\\s+";

const labelPatterns = [
  "Enunciado\\s*:",
  optionLabelPattern,
  "Resposta correta\\s*:",
  "Explica(?:cao|\\u00e7\\u00e3o)\\s*:",
  "Mat(?:e|\\u00e9)ria\\s*:",
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

function splitQuestionBlocks(input: string) {
  const text = input.replace(/\r\n/g, "\n").trim();
  if (!text) return [];

  const starts = Array.from(text.matchAll(/^Enunciado\s*:/gim), (match) => match.index ?? 0);
  if (!starts.length) return text ? [text] : [];

  return starts
    .map((start, index) => text.slice(start, starts[index + 1] ?? text.length).trim())
    .filter(Boolean);
}

function capture(block: string, labelPattern: string) {
  const pattern = new RegExp(`^${labelPattern}\\s*([\\s\\S]*?)(?=\\n(?:${labelPatterns})|(?![\\s\\S]))`, "im");
  return block.match(pattern)?.[1]?.trim() || "";
}

function captureOption(block: string, option: string) {
  const pattern = new RegExp(`^${option}[\\).]\\s*([\\s\\S]*?)(?=\\n(?:${labelPatterns})|(?![\\s\\S]))`, "im");
  return block.match(pattern)?.[1]?.trim() || "";
}

export function parseFreeTextQuestions(input: string): ParseResult[] {
  const blocks = splitQuestionBlocks(input);

  return blocks.map((block, idx) => {
    const statement = capture(block, "Enunciado\\s*:");
    const optionA = captureOption(block, "A");
    const optionB = captureOption(block, "B");
    const optionC = captureOption(block, "C");
    const optionD = captureOption(block, "D");
    const optionE = captureOption(block, "E");
    const correctOption = capture(block, "Resposta correta\\s*:").toUpperCase().replace(/[^A-E]/g, "").slice(0, 1);
    const explanation = capture(block, "Explica(?:cao|\\u00e7\\u00e3o)\\s*:");
    const subject = capture(block, "Mat(?:e|\\u00e9)ria\\s*:");
    const theme = capture(block, "Tema\\s*:");
    const difficultyRaw = normalizeKey(capture(block, "Dificuldade\\s*:"));
    const tags = capture(block, "Tags\\s*:");
    const source = capture(block, "Fonte\\s*:") || null;
    const subtheme = capture(block, "Subtema\\s*:") || null;

    const difficulty = difficultyMap[difficultyRaw] || "MEDIUM";
    const errors: string[] = [];
    if (!statement) errors.push("Enunciado ausente");
    if (!optionA || !optionB || !optionC || !optionD || !optionE) errors.push("Alternativas A-E incompletas");
    if (!correctOption) errors.push("Resposta correta ausente");
    if (correctOption && !questionOptions.includes(correctOption as (typeof questionOptions)[number])) errors.push("Resposta correta invalida");
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
