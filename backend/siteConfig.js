export function publicConfig(env = process.env) {
  const support = [];
  for (const [key, label] of [["MARU_SUPPORT_BR_URL", "Apoiar no Brasil"], ["MARU_SUPPORT_GLOBAL_URL", "Apoiar de outro país"]]) {
    if (!env[key]) continue;
    try {
      const url = new URL(env[key]);
      if (url.protocol === "https:" && !url.username && !url.password) support.push({ label, url: url.href });
    } catch { /* An invalid destination never becomes a payment link. */ }
  }
  return { support };
}
