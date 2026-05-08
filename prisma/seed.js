const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function seedQuestions() {
  const existing = await prisma.question.count();
  if (existing > 0) return;

  await prisma.question.createMany({
    data: [
      {
        statement: "Quanto e 2+2?",
        optionA: "1",
        optionB: "2",
        optionC: "3",
        optionD: "4",
        optionE: "5",
        correctOption: "D",
        explanation: "2+2=4",
        subject: "Matematica",
        theme: "Aritmetica",
        difficulty: "EASY",
        tags: "soma",
      },
      {
        statement: "Capital do Brasil?",
        optionA: "Sao Paulo",
        optionB: "Rio de Janeiro",
        optionC: "Brasilia",
        optionD: "Salvador",
        optionE: "Recife",
        correctOption: "C",
        explanation: "Brasilia e a capital federal do Brasil.",
        subject: "Geografia",
        theme: "Capitais",
        difficulty: "EASY",
        tags: "brasil",
      },
    ],
  });
}

async function seedFlashcards() {
  const existing = await prisma.flashcard.count();
  if (existing > 0) return;

  await prisma.flashcard.createMany({
    data: [
      { front: "Derivada de x^2", back: "2x", subject: "Matematica", theme: "Calculo", tags: "derivada" },
      { front: "Funcao da mitocondria", back: "Respiracao celular", subject: "Biologia", theme: "Citologia", tags: "organelas" },
    ],
  });
}

async function main() {
  await seedQuestions();
  await seedFlashcards();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
