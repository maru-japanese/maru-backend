import { EXPRESSIONS, SENTENCES } from "./catalog.js";
import { VOCABULARY } from "./vocabulary.js";

export const CULTURE_CAPSULES = [
  { lessonId: "greetings", title: "Um cumprimento tem seu momento", expressionId: "exp-hello" },
  { lessonId: "k-real-words", title: "Katakana também vive nos jogos", expressionId: "exp-update" },
  { lessonId: "sentence-question", title: "Surpresa com educação", expressionId: "exp-really" },
  { lessonId: "daily-order", title: "Antes de começar a comer", expressionId: "exp-meal" },
  { lessonId: "daily-help", title: "Pedir para repetir faz parte", expressionId: "exp-again" },
  { lessonId: "casual-register", title: "Uma expressão entre colegas", expressionId: "exp-work" },
  { lessonId: "casual-culture", title: "A conversa de quem volta para casa", expressionId: "exp-back-home" },
  { lessonId: "casual-communities", title: "Antes de contar o final", expressionId: "exp-spoiler-alert" }
].map(item => ({ ...item, expression: EXPRESSIONS.find(expression => expression.id === item.expressionId) }));

export const THEMATIC_PATHS = [
  {
    id: "travel", symbol: "旅", title: "Uma viagem, um encontro de cada vez",
    description: "Pedir um café, encontrar a estação e pedir ajuda para entender. Pequenas situações que cabem numa viagem.",
    note: "Não precisa decorar tudo: ouça, leia os exemplos e escolha uma frase para levar com você.",
    lessonIds: ["daily-order", "daily-find", "daily-help"],
    wordIds: ["word-water", "word-coffee", "word-station", "word-train", "word-bathroom", "word-shop", "word-japan", "word-umbrella"],
    sentenceIds: ["coffee", "station", "how-much", "where-bathroom"],
    expressionIds: ["exp-excuse", "exp-thanks", "exp-again", "exp-slow"]
  },
  {
    id: "anime", symbol: "話", title: "Anime, mangá e conversa entre fãs",
    description: "Entenda reações, comentários e avisos comuns em comunidades de fãs.",
    note: "Personagens e comunidades podem usar linguagem exagerada ou muito informal. Reconhecer uma expressão não significa que ela combine com toda conversa.",
    lessonIds: ["casual-register", "casual-slang", "casual-communities"],
    wordIds: ["word-book", "word-friend", "word-music", "word-fun", "word-read", "word-hear"],
    sentenceIds: ["like", "reading"],
    expressionIds: ["exp-oshi", "exp-spoiler", "exp-spoiler-alert", "exp-awesome", "exp-seriously", "exp-kusa"]
  },
  {
    id: "work", symbol: "仕", title: "Primeiras trocas no trabalho",
    description: "Apresente-se, peça para repetir e confirme uma informação com educação.",
    note: "Uma introdução a situações profissionais. Relação, contexto e cultura da equipe também influenciam a escolha das palavras.",
    lessonIds: ["sentence-identity", "daily-help", "casual-register"],
    wordIds: ["word-me", "word-person", "word-today", "word-tomorrow", "word-now", "word-write", "word-speak"],
    sentenceIds: ["identity", "write-japanese"],
    expressionIds: ["exp-first", "exp-work", "exp-interrupt", "exp-acknowledge", "exp-check", "exp-meeting", "exp-deadline"]
  }
];
export function thematicContent(id) {
  const path = THEMATIC_PATHS.find(item => item.id === id);
  return path ? { ...path, words: path.wordIds.map(id => VOCABULARY.find(item => item.id === id)), sentences: path.sentenceIds.map(id => SENTENCES.find(item => item.id === id)), expressions: path.expressionIds.map(id => EXPRESSIONS.find(item => item.id === id)) } : null;
}
