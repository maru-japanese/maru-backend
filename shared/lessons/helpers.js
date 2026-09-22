export const example = (jp, romaji, pt, note = "") => ({ jp, romaji, pt, note });
export const section = (title, body, examples = [], tip = "") => ({ title, body, examples, tip });
export const question = (prompt, choices, answer, explanation) => ({ prompt, choices, answer, explanation });
export const lesson = (id, title, minutes, goal, sections, quiz, practice = null) => ({ id, title, minutes, goal, sections, quiz, practice });
