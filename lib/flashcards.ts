import { formText } from "./questions";

export type FlashcardInput = {
  front: string;
  back: string;
  subject: string;
  theme: string;
  tags: string;
};

export function readFlashcardFormData(formData: FormData): FlashcardInput {
  return {
    front: formText(formData, "front"),
    back: formText(formData, "back"),
    subject: formText(formData, "subject"),
    theme: formText(formData, "theme"),
    tags: formText(formData, "tags"),
  };
}

export function validateFlashcardInput(data: FlashcardInput) {
  if (!data.front || !data.back) return "Frente e verso sao obrigatorios";
  return null;
}
