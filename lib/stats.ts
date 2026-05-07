import { prisma } from "./prisma";
import { summarizeAttempts } from "./stats-core";

export { summarizeAttempts };

const DASHBOARD_RESET_ID = "default";
const EPOCH = new Date("1970-01-01T00:00:00.000Z");

type ResetRow = {
  answeredResetAt: string | Date;
  accuracyResetAt: string | Date;
};

function asDate(value: string | Date | null | undefined) {
  if (!value) return EPOCH;
  return value instanceof Date ? value : new Date(value);
}

async function ensureDashboardReset() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "DashboardCounterReset" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "answeredResetAt" DATETIME NOT NULL DEFAULT '1970-01-01T00:00:00.000Z',
      "accuracyResetAt" DATETIME NOT NULL DEFAULT '1970-01-01T00:00:00.000Z',
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await prisma.$executeRawUnsafe(`
    INSERT OR IGNORE INTO "DashboardCounterReset" ("id", "answeredResetAt", "accuracyResetAt", "updatedAt")
    VALUES ('${DASHBOARD_RESET_ID}', '1970-01-01T00:00:00.000Z', '1970-01-01T00:00:00.000Z', CURRENT_TIMESTAMP)
  `);
}

async function getDashboardReset() {
  await ensureDashboardReset();
  const rows = await prisma.$queryRawUnsafe<ResetRow[]>(`
    SELECT "answeredResetAt", "accuracyResetAt"
    FROM "DashboardCounterReset"
    WHERE "id" = '${DASHBOARD_RESET_ID}'
    LIMIT 1
  `);

  return {
    answeredResetAt: asDate(rows[0]?.answeredResetAt),
    accuracyResetAt: asDate(rows[0]?.accuracyResetAt),
  };
}

export async function resetDashboardCounter(kind: "answered" | "accuracy") {
  await ensureDashboardReset();
  const field = kind === "answered" ? "answeredResetAt" : "accuracyResetAt";
  await prisma.$executeRawUnsafe(`
    UPDATE "DashboardCounterReset"
    SET "${field}" = '${new Date().toISOString()}', "updatedAt" = CURRENT_TIMESTAMP
    WHERE "id" = '${DASHBOARD_RESET_ID}'
  `);
}

export async function getDashboard() {
  const resets = await getDashboardReset();
  const [q, f, allAttempts, answeredSinceReset, accuracySinceReset] = await Promise.all([
    prisma.question.count(),
    prisma.flashcard.count(),
    prisma.questionAttempt.findMany({ include: { question: true } }),
    prisma.questionAttempt.count({ where: { createdAt: { gte: resets.answeredResetAt } } }),
    prisma.questionAttempt.findMany({ where: { createdAt: { gte: resets.accuracyResetAt } }, include: { question: true } }),
  ]);

  const allTime = summarizeAttempts(allAttempts);
  const resettableAccuracy = summarizeAttempts(accuracySinceReset);

  return {
    q,
    f,
    attempts: allTime.total,
    ...allTime,
    allTime,
    resettable: {
      answered: answeredSinceReset,
      accuracyCorrect: resettableAccuracy.correct,
      accuracyTotal: resettableAccuracy.total,
      accuracyRate: resettableAccuracy.rate,
      answeredResetAt: resets.answeredResetAt,
      accuracyResetAt: resets.accuracyResetAt,
    },
  };
}
