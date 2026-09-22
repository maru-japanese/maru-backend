import { MODULES, LESSONS } from "./curriculum.js";

export function nextLesson(snapshot) {
  const module = MODULES.find(item => item.id === snapshot.placement?.acceptedModule);
  const start = module ? LESSONS.findIndex(item => item.id === module.lessons[0].id) : 0;
  return LESSONS.slice(start).find(item => !snapshot.lessons[item.id]?.completedAt);
}

export const moduleSeals = snapshot => MODULES.map(module => ({
  ...module,
  done: module.lessons.filter(lesson => snapshot.lessons[lesson.id]?.completedAt).length,
  earned: module.lessons.every(lesson => snapshot.lessons[lesson.id]?.completedAt)
}));
