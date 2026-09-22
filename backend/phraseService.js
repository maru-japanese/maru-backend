import { checkGuidedSentence, normalizeSentence } from "../shared/sentenceCheck.js";

export function checkPhrase({ text, exerciseId, item } = {}) {
  if (exerciseId) return checkGuidedSentence(exerciseId, text);
  const phrase = String(text || "").trim();
  if (!phrase) return {
    status: "empty", correct: false, nota: "precisa melhorar",
    comentario: "Escreva uma frase antes de verificar.",
    frase_corrigida: item?.example || ""
  };
  // Legacy clients receive an honest reference comparison, never a fabricated grammar grade.
  const matches = Boolean(item?.example && normalizeSentence(phrase) === normalizeSentence(item.example));
  return {
    status: matches ? "reference" : "unverified",
    correct: matches,
    nota: matches ? "modelo reconhecido" : "não avaliada",
    comentario: matches
      ? "Sua frase corresponde ao exemplo de referência."
      : "Não posso confirmar a gramática de uma frase livre. Compare com o exemplo ou escolha um exercício guiado.",
    frase_corrigida: item?.example || ""
  };
}
