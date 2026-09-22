import { localDay, currentStreak } from "./progress.js";
import { LESSONS } from "./curriculum.js";
export function playerLevel(total) {
  const level = Math.floor(Math.sqrt(Math.max(0, total) / 50)) + 1;
  const floor = 50 * (level - 1) ** 2;
  const next = 50 * level ** 2;
  return { level, earned: total - floor, needed: next - floor, next, percent: Math.floor((total - floor) / (next - floor) * 100) };
}
export const ACHIEVEMENTS = [
  { id: "first", symbol: "始", title: "Primeiro passo", description: "Conclua uma lição.", test: p => Object.values(p.lessons).some(item => item.completedAt) },
  { id: "vowels", symbol: "あ", title: "Cinco novos sons", description: "Acerte as cinco vogais em hiragana.", test: p => [0, 1, 2, 3, 4].every(i => p.reviews["h-a-" + i]?.correct > 0) },
  { id: "pen", symbol: "筆", title: "Tinta no papel", description: "Registre uma prática de escrita.", test: p => p.stats.writingSessions >= 1 },
  { id: "sentence", symbol: "文", title: "Ideia completa", description: "Acerte cinco frases guiadas.", test: p => Object.keys(p.reviews).filter(id => id.startsWith("sentence-") && p.reviews[id].correct > 0).length >= 5 },
  { id: "ears", symbol: "聞", title: "Ouvido atento", description: "Acerte cinco atividades de escuta.", test: p => Object.keys(p.reviews).filter(id => id.startsWith("listen-") && p.reviews[id].correct > 0).length >= 5 },
  { id: "week", symbol: "七", title: "Uma semana de prática", description: "Acumule sete dias de constância, com espaço para uma pausa semanal.", test: p => currentStreak(p) >= 7 },
  { id: "ten", symbol: "十", title: "Base em construção", description: "Conclua dez lições.", test: p => LESSONS.filter(item => p.lessons[item.id]?.completedAt).length >= 10 },
  { id: "collector", symbol: "知", title: "Pequeno repertório", description: "Acerte 30 itens diferentes.", test: p => Object.values(p.reviews).filter(item => item.correct > 0).length >= 30 }
];
export function dailyMissions(p, now = Date.now()) {
  const today = localDay(now);
  return [
    { title: "Dê seu passo de hoje", description: p.preferences.dailyGoal + " atividades no seu ritmo.", current: Math.min(p.preferences.dailyGoal, p.activity[today] || 0), target: p.preferences.dailyGoal },
    { title: "Descubra uma ideia nova", description: "Conclua uma lição hoje.", current: Math.min(1, Object.values(p.lessons).filter(item => item.completedAt && localDay(item.completedAt) === today).length), target: 1 },
    { title: "Pratique o que aprendeu", description: "Responda cinco itens diferentes hoje.", current: Math.min(5, Object.values(p.reviews).filter(item => item.attempts && localDay(item.updatedAt) === today).length), target: 5 }
  ];
}
