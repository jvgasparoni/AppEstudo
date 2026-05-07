export type Rating = "AGAIN" | "HARD" | "GOOD" | "EASY";
export type SrsState = { intervalDays: number; easeFactor: number; reviewCount: number; lapseCount: number };

export function nextSrs(state: SrsState, rating: Rating, options?: { againToday?: boolean }) {
  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
  let intervalDays = state.intervalDays;
  let easeFactor = state.easeFactor;
  let lapseIncrement = 0;
  const againToday = options?.againToday ?? true;

  if (rating === "AGAIN") {
    intervalDays = againToday ? 0 : 1;
    easeFactor = clamp(easeFactor - 0.2, 1.3, 3);
    lapseIncrement = 1;
  } else if (rating === "HARD") {
    intervalDays = Math.max(2, Math.round(intervalDays * 1.2));
    easeFactor = clamp(easeFactor - 0.05, 1.3, 3);
  } else if (rating === "GOOD") {
    intervalDays = Math.max(2, Math.round(intervalDays * easeFactor));
    easeFactor = clamp(easeFactor + 0.05, 1.3, 3);
  } else {
    intervalDays = Math.max(3, Math.round(intervalDays * easeFactor * 1.3));
    easeFactor = clamp(easeFactor + 0.15, 1.3, 3);
  }

  return { intervalDays, easeFactor, reviewCount: state.reviewCount + 1, lapseCount: state.lapseCount + lapseIncrement };
}

export const isCorrect = (selected: string, correct: string) => selected === correct;
