import { VOCABULARY, VOCABULARY_GROUPS } from "../shared/vocabulary.js";
import { EXERCISE_GROUPS } from "../shared/exercises.js";
import { GLOSSARY } from "../shared/glossary.js";
import { DATA, LEVELS, LEVEL_META, CAT_LABEL, CAT_LABEL_SING, KANA, KANA_ROWS, KANA_GROUPS, BUILDER_PATTERNS } from "../shared/content.js";
import { MODULES, LESSONS } from "../shared/curriculum.js";
import { BEGINNER_KANJI, EXPRESSIONS, PARTICLES, SENTENCES, COMBINATIONS } from "../shared/catalog.js";

export const CONTENT = {
  vocabulary: VOCABULARY, vocabularyGroups: VOCABULARY_GROUPS, exerciseGroups: EXERCISE_GROUPS, glossary: GLOSSARY,
  data: DATA, levels: LEVELS, levelMeta: LEVEL_META, catLabel: CAT_LABEL, catLabelSingular: CAT_LABEL_SING,
  kanaRows: KANA_ROWS, kanaGroups: KANA_GROUPS, kana: KANA, builderPatterns: BUILDER_PATTERNS,
  modules: MODULES, lessons: LESSONS, beginnerKanji: BEGINNER_KANJI, expressions: EXPRESSIONS,
  particles: PARTICLES, sentences: SENTENCES, combinations: COMBINATIONS
};
