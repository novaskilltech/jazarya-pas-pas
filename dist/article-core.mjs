export function verseAttribution(number, lang) {
  if (![107, 109].includes(number)) return '';
  return lang === 'ar'
    ? 'تنبيه نصي: من زيادات النسخة المتداولة، وليس ضمن المتن الأصلي المعتمد في تحقيق القاسم (حواشي الخاتمة، ص 97): https://shamela.ws/book/581/95'
    : 'Note de texte : ajout de la version courante, hors du texte original retenu par al-Qāsim (notes de conclusion, p. 97) : https://shamela.ws/book/581/95';
}

export function verseText(verse, lang) {
  return [verse.text, verseAttribution(verse.n, lang)].filter(Boolean).join('\n\n');
}

export function articleText(article, verse, lang, pageUrl = '') {
  const entry = article[lang];
  const refLabel = lang === 'ar' ? 'المراجع' : 'Références';
  return [entry.title, verseText(verse, lang), ...entry.sections.flatMap(s => [s.title, ...s.paragraphs]), refLabel,
    ...article.references.map((r,i) => [`[${i+1}] ${r[lang]} — ${r.url}`, ...(r.links || []).map(p => `${p[lang]} — ${p.url}`)].join('\n')), pageUrl].filter(Boolean).join('\n\n');
}

export async function writeClipboard(text, clipboard, fallback) {
  if (clipboard?.writeText) {
    try { await clipboard.writeText(text); return true; } catch { /* Try the browser fallback. */ }
  }
  try { return Boolean(fallback?.(text)); } catch { return false; }
}
