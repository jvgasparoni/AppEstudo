import test from "node:test";
import assert from "node:assert/strict";
import { readFlashcardFormData, validateFlashcardInput } from "../lib/flashcards";

test("read flashcard form data trims values", () => {
  const formData = new FormData();
  formData.set("front", " Frente ");
  formData.set("back", " Verso ");
  formData.set("subject", " Materia ");
  formData.set("theme", " Tema ");
  formData.set("tags", " tag ");

  assert.deepEqual(readFlashcardFormData(formData), {
    front: "Frente",
    back: "Verso",
    subject: "Materia",
    theme: "Tema",
    tags: "tag",
  });
});

test("validate flashcard input requires front and back", () => {
  assert.equal(validateFlashcardInput({ front: "F", back: "B", subject: "", theme: "", tags: "" }), null);
  assert.match(validateFlashcardInput({ front: "", back: "B", subject: "", theme: "", tags: "" }) || "", /Frente e verso/);
  assert.match(validateFlashcardInput({ front: "F", back: "", subject: "", theme: "", tags: "" }) || "", /Frente e verso/);
});
