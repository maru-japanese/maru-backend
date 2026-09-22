import assert from "node:assert/strict";
import test from "node:test";
import { checkPhrase } from "../backend/phraseService.js";
import { BUILDER_PATTERNS, DATA, KANA, LEVELS } from "../shared/content.js";
import { isTypedAnswerCorrect, kanaToRomaji, readingVariants } from "../shared/romaji.js";

test("shared study content is available", function(){
  assert.equal(LEVELS.length, 5);
  assert.equal(DATA.length, 120);
  assert.equal(KANA.length, 142);
  assert.ok(BUILDER_PATTERNS.length >= 5);
});

test("free text is never graded as grammatically correct just for containing the target", function(){
  const result = checkPhrase({
    level: "N5",
    text: "私は日本語が好きです。",
    item: { term: "好き", example: "音楽が好きです。" }
  });

  assert.equal(result.status, "unverified");
  assert.equal(result.correct, false);
  assert.equal(result.frase_corrigida, "音楽が好きです。");
});

test("phrase checker rejects non Japanese input", function(){
  const result = checkPhrase({
    level: "N5",
    text: "eu gosto de japones",
    item: { term: "好き", example: "音楽が好きです。" }
  });

  assert.equal(result.correct, false);
  assert.equal(result.status, "unverified");
});

test("guided phrase checker accepts a complete model written in romaji", function(){
  const result = checkPhrase({
    level: "N5",
    exerciseId: "identity",
    text: "watashi wa gakusei desu"
  });

  assert.equal(result.correct, true);
});

test("kanaToRomaji converts gemination and small-kana digraphs", function(){
  assert.equal(kanaToRomaji("がっこう"), "gakkou");
  assert.equal(kanaToRomaji("しゃしん"), "shashin");
  assert.equal(kanaToRomaji("わたし"), "watashi");
});

test("readingVariants expands parenthesized okurigana", function(){
  assert.deepEqual(readingVariants("はな(す)"), ["はな", "はなす"]);
});

test("isTypedAnswerCorrect accepts romaji, kana and kanji for the same item", function(){
  const item = { term: "話", reading: "わ・はな(す)" };
  assert.ok(isTypedAnswerCorrect("hanasu", item));
  assert.ok(isTypedAnswerCorrect("はなす", item));
  assert.ok(isTypedAnswerCorrect("話", item));
  assert.ok(!isTypedAnswerCorrect("tabemasu", item));
});
