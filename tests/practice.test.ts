import test from "node:test";
import assert from "node:assert/strict";
import { pickLeastAttemptedQuestion } from "../lib/practice";

const questions = [
  { id: 1, _count: { attempts: 3 } },
  { id: 2, _count: { attempts: 1 } },
  { id: 3, _count: { attempts: 1 } },
  { id: 4, _count: { attempts: 2 } },
];

test("pick practice question from least attempted group", () => {
  assert.equal(pickLeastAttemptedQuestion(questions, () => 0)?.id, 2);
  assert.equal(pickLeastAttemptedQuestion(questions, () => 0.99)?.id, 3);
});

test("pick practice question handles empty lists", () => {
  assert.equal(pickLeastAttemptedQuestion([]), null);
});
