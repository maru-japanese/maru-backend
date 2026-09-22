import { KANA, KANA_ROWS } from "./content.js";

var SINGLE_MAP = {};
KANA.forEach(function(k){ SINGLE_MAP[k.char] = k.romaji; });
Object.assign(SINGLE_MAP, { "ぁ": "a", "ぃ": "i", "ぅ": "u", "ぇ": "e", "ぉ": "o", "ァ": "a", "ィ": "i", "ゥ": "u", "ェ": "e", "ォ": "o" });

var DIGRAPH_PREFIX = {
  ka: "ky", sa: "sh", ta: "ch", na: "ny", ha: "hy", ma: "my", ra: "ry",
  ga: "gy", za: "j", da: "j", ba: "by", pa: "py"
};
var SMALL_Y_VOWEL = { "ゃ": "a", "ゅ": "u", "ょ": "o", "ャ": "a", "ュ": "u", "ョ": "o" };
var SOKUON = { "っ": true, "ッ": true };
var LONG_MARK = "ー";

var DIGRAPH_MAP = {};
Object.assign(DIGRAPH_MAP, { "ファ": "fa", "フィ": "fi", "フェ": "fe", "フォ": "fo", "ティ": "ti", "ディ": "di", "トゥ": "tu", "ドゥ": "du", "ウィ": "wi", "ウェ": "we", "ウォ": "wo", "シェ": "she", "チェ": "che", "ジェ": "je" });
KANA_ROWS.forEach(function(row){
  var prefix = DIGRAPH_PREFIX[row.id];
  if(!prefix) return;
  [["h", ["ゃ", "ゅ", "ょ"]], ["k", ["ャ", "ュ", "ョ"]]].forEach(function(pair){
    var base = row[pair[0]][1];
    if(!base) return;
    pair[1].forEach(function(small){
      DIGRAPH_MAP[base + small] = prefix + SMALL_Y_VOWEL[small];
    });
  });
});

export function kanaToRomaji(input){
  var s = String(input || "");
  var out = "";
  var i = 0;
  while(i < s.length){
    var two = s.slice(i, i + 2);
    if(DIGRAPH_MAP[two]){
      out += DIGRAPH_MAP[two];
      i += 2;
      continue;
    }

    var ch = s[i];

    if(SOKUON[ch]){
      var nextTwo = s.slice(i + 1, i + 3);
      var nextRomaji = DIGRAPH_MAP[nextTwo] || SINGLE_MAP[s[i + 1]] || "";
      var lead = nextRomaji.startsWith("ch") ? "t" : nextRomaji.slice(0, 1);
      out += /^[bcdfghjklmpqrstvwxyz]$/.test(lead) ? lead : "";
      i += 1;
      continue;
    }

    if(ch === LONG_MARK){
      var prevVowel = out.slice(-1);
      out += /[aiueo]/.test(prevVowel) ? prevVowel : "";
      i += 1;
      continue;
    }

    out += SINGLE_MAP[ch] || ch;
    i += 1;
  }
  return out;
}

export function cleanTerm(term){
  return String(term || "").replace(/[〜~]/g, "").trim();
}

export function readingVariants(reading){
  if(!reading) return [];
  var out = [];
  String(reading).split("・").forEach(function(segment){
    segment = segment.trim();
    if(!segment) return;
    var m = segment.match(/^(.*?)\(([^)]*)\)(.*)$/);
    if(m){
      out.push((m[1] + m[3]).trim());
      out.push((m[1] + m[2] + m[3]).trim());
    } else {
      out.push(segment);
    }
  });
  return out.filter(function(v, idx){ return v && out.indexOf(v) === idx; });
}

var ALT_SPELLINGS = [
  [/si/g, "shi"], [/ti/g, "chi"], [/tu/g, "tsu"], [/hu/g, "fu"],
  [/zi/g, "ji"], [/di/g, "ji"], [/du/g, "zu"]
];

export function normalizeRomajiInput(str){
  var s = String(str || "")
    .toLowerCase()
    .trim()
    .normalize("NFKC")
    .replace(/ā/g, "aa").replace(/ī/g, "ii").replace(/ū/g, "uu")
    .replace(/ē/g, "ee").replace(/ō/g, "ou")
    .replace(/[\s\-_']/g, "");
  ALT_SPELLINGS.forEach(function(pair){ s = s.replace(pair[0], pair[1]); });
  return s;
}

export function buildAcceptedAnswers(item){
  var exact = new Set();
  var romaji = new Set();
  var term = cleanTerm(item && item.term);

  if(term){
    exact.add(term);
    var termRomaji = kanaToRomaji(term).toLowerCase();
    if(termRomaji && termRomaji !== term.toLowerCase()) romaji.add(termRomaji);
  }

  readingVariants(item && item.reading).forEach(function(variant){
    exact.add(variant);
    var r = kanaToRomaji(variant).toLowerCase();
    if(r) romaji.add(r);
  });

  return { exact: exact, romaji: romaji };
}

export function isTypedAnswerCorrect(input, item){
  var raw = String(input || "").trim();
  if(!raw) return false;

  var accepted = buildAcceptedAnswers(item);
  if(accepted.exact.has(raw) || accepted.exact.has(cleanTerm(raw))) return true;

  return [...accepted.romaji].some(form => normalizeRomajiInput(form) === normalizeRomajiInput(raw));
}

export function primaryDisplayAnswer(item){
  var variants = readingVariants(item && item.reading);
  var romaji = variants.map(function(v){ return kanaToRomaji(v); }).filter(Boolean).join(" / ");
  return {
    term: cleanTerm(item && item.term),
    reading: (item && item.reading) || "",
    romaji: romaji
  };
}
