import { ALL_KANA, BEGINNER_KANJI, PARTICLES, EXPRESSIONS, SENTENCES } from "./catalog.js";
import { VOCABULARY } from "./vocabulary.js";
import { LESSONS } from "./curriculum.js";
import { DATA } from "./content.js";
import { PARTICLE_EXERCISES, SITUATION_EXERCISES } from "./exercises.js";
import { audioKey } from "./audioText.js";

export function pronunciationCatalog() {
  const entries = new Map();
  const add = (text, spoken = text) => {
    const key = audioKey(text);
    if (key && /[ぁ-ヺ一-龯]/u.test(key) && !entries.has(key)) entries.set(key, { key, text, spoken });
  };
  // Standalone characters and ambiguous words use the reading actually taught.
  ALL_KANA.forEach(item => add(item.char, item.char === "を" || item.char === "ヲ" ? "お" : item.char));
  BEGINNER_KANJI.forEach(item => { add(item.char, item.reading); add(item.word, item.wordReading); });
  VOCABULARY.forEach(item => add(item.jp, item.reading));
  SENTENCES.forEach(item => item.tokens.forEach(token => add(token[0], token[3] || token[0])));
  VOCABULARY.forEach(item => add(item.sentence));
  LESSONS.forEach(lesson => lesson.sections.forEach(section => section.examples.forEach(item => add(item.jp))));
  PARTICLES.forEach(item => add(item.jp));
  EXPRESSIONS.forEach(item => add(item.jp));
  SENTENCES.forEach(item => add(item.tokens.map(token => token[0]).join("") + "。"));
  DATA.forEach(item => add(item.example));
  [...PARTICLE_EXERCISES, ...SITUATION_EXERCISES].forEach(item => add(item.speech));
  add("こんにちは");
  return [...entries.values()];
}

const catalogue = new Map(pronunciationCatalog().map(item => [item.key, item]));
export const getPronunciation = text => catalogue.get(audioKey(text));
