export const GLOSSARY = [
  { id: "word", term: "Palavra", aliases: ["palavra"], definition: "Uma unidade com significado, como “água” em português ou みず (mizu) em japonês.", example: "Uma palavra pode ter vários caracteres: みず tem dois kana e é uma palavra." },
  { id: "sentence", term: "Frase", aliases: ["frase"], definition: "Um enunciado que transmite uma ideia em um contexto. Pode conter uma ação, uma descrição ou uma pergunta.", example: "みずをのみます (mizu o nomimasu): bebo água." },
  { id: "kana", term: "Kana", aliases: ["kana", "silabário"], definition: "Nome que reúne hiragana e katakana: caracteres que representam sons.", example: "あ e ア representam a vogal a. A forma muda, o som básico é o mesmo." },
  { id: "hiragana", term: "Hiragana", aliases: ["hiragana"], definition: "Escrita de formas geralmente curvas. Registra sons, palavras e muitas terminações gramaticais.", example: "ねこ (neko): gato." },
  { id: "katakana", term: "Katakana", aliases: ["katakana"], definition: "Escrita de formas geralmente angulares. É frequente em nomes estrangeiros, empréstimos e efeitos sonoros.", example: "カメラ (kamera): câmera." },
  { id: "kanji", term: "Kanji", aliases: ["kanji"], definition: "Caractere ligado a significados. A maneira de pronunciá-lo depende da palavra em que ele aparece.", example: "水 sozinho: みず (mizu), água. Em 水曜日: すい (sui), parte da palavra quarta-feira." },
  { id: "romaji", term: "Romaji", aliases: ["romaji", "romanização"], definition: "Japonês representado com letras latinas, como as usadas no português. Ajuda você a acompanhar a leitura.", example: "ありがとう → arigatō. A barrinha em ō indica que a vogal é longa." },
  { id: "reading", term: "Leitura", aliases: ["leitura"], definition: "O modo de pronunciar uma palavra ou um caractere naquele contexto.", example: "学校 tem a leitura がっこう (gakkō) e significa escola." },
  { id: "noun", term: "Substantivo", aliases: ["substantivo", "substantivos", "nominal"], definition: "Palavra que dá nome a uma pessoa, lugar, coisa ou ideia.", example: "本 (hon, livro) e 学生 (gakusei, estudante) são substantivos." },
  { id: "verb", term: "Verbo", aliases: ["verbo", "verbal"], definition: "Palavra que expressa uma ação, estado ou acontecimento. No japonês, costuma aparecer no final da frase.", example: "Em 水を飲みます, 飲みます (nomimasu) é beber na forma educada." },
  { id: "adjective", term: "Adjetivo", aliases: ["adjetivo", "adjetivos"], definition: "Palavra usada para descrever uma característica.", example: "おいしい (oishii) significa gostoso. Em おいしいパン, descreve o pão." },
  { id: "particle", term: "Partícula", aliases: ["partícula", "partículas"], definition: "Uma palavra curta que mostra o papel de outra palavra ou acrescenta intenção à frase.", example: "Em 水を飲みます, を vem depois de 水 e mostra o que é bebido." },
  { id: "topic", term: "Tópico", aliases: ["tópico"], definition: "Aquilo sobre o que você está falando. Pode ser introduzido com は, pronunciado wa.", example: "わたしは学生です: quanto a mim, sou estudante." },
  { id: "subject", term: "Sujeito", aliases: ["sujeito"], definition: "Quem ou o que participa do estado ou ação expressos. が pode marcar o sujeito.", example: "猫がいます (neko ga imasu): há um gato. 猫 é o sujeito." },
  { id: "object", term: "Objeto direto", aliases: ["objeto direto", "objeto"], definition: "Aquilo sobre o que a ação do verbo recai nos exemplos introdutórios.", example: "Em “bebo água”, água é o que eu bebo. Em 水を飲みます, 水 vem antes de を." },
  { id: "mora", term: "Mora", aliases: ["mora", "moras"], definition: "Uma pequena unidade de tempo do ritmo japonês. Não é sempre igual à sílaba do português.", example: "がっこう tem quatro tempos: が / っ / こ / う. きゃ tem só um." },
  { id: "long-vowel", term: "Vogal longa", aliases: ["vogal longa", "vogais longas"], definition: "Uma vogal pronunciada por mais tempo. Esse tempo extra pode distinguir palavras.", example: "おばさん (obasan): tia. おばあさん (obāsan): avó." },
  { id: "dakuten", term: "Dakuten", aliases: ["dakuten"], definition: "Os dois pequenos traços ゛ que alteram o som de certos kana.", example: "か (ka) vira が (ga). は (ha) vira ば (ba)." },
  { id: "handakuten", term: "Handakuten", aliases: ["handakuten"], definition: "O pequeno círculo ゜ que transforma os sons da fileira H em sons com P.", example: "は (ha) → ぱ (pa); ひ (hi) → ぴ (pi)." },
  { id: "okurigana", term: "Okurigana", aliases: ["okurigana"], definition: "Kana que acompanham um kanji em uma palavra, incluindo terminações que mudam com a forma gramatical.", example: "Em 食べる, os kana べる acompanham 食. Na forma educada: 食べます." },
  { id: "inflection", term: "Flexão", aliases: ["flexão", "flexões", "conjugação"], definition: "Mudança na forma de uma palavra para expressar informações, como tempo ou negação.", example: "食べます: como / vou comer. 食べました: comi. 食べません: não como / não vou comer." },
  { id: "dictionary", term: "Forma de dicionário", aliases: ["forma de dicionário", "forma do dicionário"], definition: "A forma pela qual você procura um verbo no dicionário. É a afirmativa simples não passada.", example: "食べる (taberu) é a forma de dicionário; 食べます (tabemasu) é a forma educada." },
  { id: "register", term: "Registro", aliases: ["registro", "formalidade"], definition: "A maneira de falar escolhida conforme a relação entre as pessoas e a situação.", example: "ありがとう é mais casual; ありがとうございます é educado." },
  { id: "loanword", term: "Empréstimo", aliases: ["empréstimo", "empréstimos"], definition: "Uma palavra incorporada de outro idioma e adaptada aos sons e usos do japonês.", example: "コーヒー (kōhī): café. A pronúncia japonesa não é idêntica à inglesa." },
  { id: "slang", term: "Gíria e jargão", aliases: ["gíria", "gírias", "jargão", "jargões"], definition: "Gíria é uma expressão informal. Jargão é vocabulário associado a uma atividade ou comunidade. O uso depende de quem fala e com quem.", example: "ネタバレ (netabare) é spoiler; マジ？ (maji?) é um “Sério?” informal." },
  { id: "srs", term: "Revisão espaçada", aliases: ["revisão espaçada"], definition: "Voltar ao conteúdo em intervalos. Os itens difíceis reaparecem mais cedo; os acertos ganham intervalos maiores.", example: "Aqui, um erro retorna em 10 minutos; um acerto começa com 1 dia de intervalo." }
];

export function conceptsIn(text) {
  const normalized = String(text).toLocaleLowerCase("pt-BR");
  return GLOSSARY.filter(item => item.aliases.some(alias => new RegExp("(^|[^\\p{L}])" + alias + "([^\\p{L}]|$)", "u").test(normalized))).slice(0, 5);
}
