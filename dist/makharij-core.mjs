export function ficheText(fiche, lang, pageUrl = '') {
  const entry = fiche[lang];
  return [entry.title, entry.observation, entry.note,
    `${lang === 'ar' ? 'مرجع الشرح' : 'Référence du commentaire'} : ${fiche.reference[lang]} ${fiche.reference.url}`,
    `${lang === 'ar' ? 'مصدر الرسم' : 'Source de l’illustration'} : ${fiche.source.name} — ${fiche.source.url}`,
    pageUrl].filter(Boolean).join('\n\n');
}

export function relatedFiches(fiches, verse) {
  return fiches.filter(f => f.verses.includes(verse));
}
