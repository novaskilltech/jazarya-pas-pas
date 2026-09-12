import {ficheText} from './makharij-core.mjs';
import {articleText, writeClipboard, verseText, verseAttribution} from './article-core.mjs';
import {escapeHtml as esc} from './reader-core.mjs';

export function createArticles({ar, lang, chapters, icon, num, footer, fiches, illustrationUI}) {
  let articles;
  let pending;
  const words = ar ? {
    label:'شرح الأبيات بالتفصيل',open:'اقرأ شرح البيت',copyVerse:'نسخ البيت',copyArticle:'نسخ الشرح مع المراجع',copyBrief:'نسخ الشرح المختصر',copied:'تم النسخ',references:'المراجع ومواضع الاستفادة',back:'العودة إلى الدرس',prev:'البيت السابق',next:'البيت التالي',verse:'البيت',loading:'جارٍ تحميل الشروح…',error:'تعذر تحميل الشروح.',retry:'إعادة المحاولة',manual:'لم يتم النسخ تلقائيًا. حدد النص وانسخه من هنا.',close:'إغلاق',method:'هذه المقالات صياغة تعليمية مركبة من المراجع المبينة، وليست نقلًا حرفيًا ولا نسبةً لجميع التفاصيل إلى شارح واحد. الأمثلة التطبيقية موجهة إلى رواية حفص ما لم يُذكر غير ذلك.'
  } : {
    label:'Vers par vers',open:'Lire le commentaire',copyVerse:'Copier le vers',copyArticle:'Copier avec les références',copyBrief:'Copier l’explication courte',copied:'Copié',references:'Références et passages consultés',back:'Revenir au chapitre',prev:'Vers précédent',next:'Vers suivant',verse:'Vers',loading:'Chargement des commentaires…',error:'Impossible de charger les commentaires.',retry:'Réessayer',manual:'La copie automatique a échoué. Sélectionnez et copiez le texte ci-dessous.',close:'Fermer',method:'Ces articles sont des synthèses pédagogiques des références indiquées, et non des citations intégrales ni l’attribution de chaque détail à un seul commentateur. Les applications suivent la transmission de Ḥafṣ, sauf indication contraire.'
  };
  const allVerses = chapters.flatMap(c=>c.verses);
  const getVerse = n=>allVerses.find(v=>v.n===Number(n));
  const getChapter = n=>chapters.find(c=>c.verses.some(v=>v.n===Number(n)));
  const copyButton=(kind,n,label)=>`<button type="button" class="copy-button" data-copy="${kind}" data-number="${n}">${icon('copy')}<span>${label}</span></button>`;
  function verse(v) { return `<div class="verse-unit"><div class="verse-row" lang="ar" dir="rtl"><span class="verse-number">${num(v.n)}</span><p>${v.text.split('…').map(p=>`<span>${esc(p.trim())}</span>`).join('')}</p></div>${verseAttribution(v.n,lang)?`<p class="verse-attribution">${esc(verseAttribution(v.n,lang).split('https://')[0])}<a href="https://shamela.ws/book/581/95" target="_blank" rel="noopener noreferrer">${ar?'المصدر':'Source'}</a></p>`:''}<div class="verse-actions">${copyButton('verse',v.n,words.copyVerse)}<a class="detail-link" href="#bayt/${v.n}">${words.open}${icon('arrow','directional')}</a></div>${illustrationUI.related(v.n)}</div>`; }
  async function load() {
    if(articles)return articles;
    if(!pending)pending=fetch('/articles.json').then(r=>{if(!r.ok)throw Error('articles');return r.json()}).then(data=>{
      if(!Array.isArray(data)||data.length!==allVerses.length||data.some(a=>!a[lang]?.sections?.length))throw Error('Invalid articles');
      articles=data;return data;
    }).catch(e=>{pending=undefined;throw e});
    return pending;
  }
  function index(c){return `<section class="article-directory"><div class="directory-heading"><h2>${words.label}</h2><p>${words.method}</p></div>${c.verses.map(v=>`<article class="paper verse-card">${verse(v)}</article>`).join('')}</section>`;}
  function referenceText(text,a){return esc(text).replace(/\[(\d+)\]/g,(match,n)=>{const r=a.references[Number(n)-1];return r?`<a class="citation" href="${esc(r.url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(r[lang])}">[${n}]</a>`:match});}
  async function renderArticle(n,target) {
    const requestHash=location.hash;
    target.innerHTML=`<p role="status">${words.loading}</p>`;
    try {
      const data=await load();
      if(location.hash!==requestHash)return;
      const a=data.find(a=>a.n===n),v=getVerse(n),c=getChapter(n),entry=a?.[lang];
      if(!entry||!v||!c)throw Error('Missing article');
      document.title=`${entry.title} — ${ar?'الجزرية':'La Jazariyya'}`;
      target.innerHTML=`<div class="breadcrumb"><a href="#${c.id}/tafsil">${words.back}</a>${icon('chevron','directional')}<span>${words.verse} ${num(n)}</span></div><article class="detailed-article"><header class="article-heading"><span class="eyebrow">${words.verse} ${num(n)}</span><h1>${esc(entry.title)}</h1>${copyButton('article',n,words.copyArticle)}</header><section class="paper article-verse">${verse(v)}</section><div class="article-body">${entry.sections.map(s=>`<section class="article-section"><h2>${esc(s.title)}</h2>${s.paragraphs.map(p=>`<p>${referenceText(p,a)}</p>`).join('')}</section>`).join('')}</div><aside class="article-references"><h2>${words.references}</h2><ol>${a.references.map(r=>`<li><a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${esc(r[lang])}</a>${(r.links||[]).map(p=>` <a class="source-page" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">${esc(p[lang])}</a>`).join('')}</li>`).join('')}</ol><p>${words.method}</p></aside></article><nav class="chapter-pagination" aria-label="${words.label}">${n>1?`<a href="#bayt/${n-1}">${icon('arrow','directional back')}${words.prev}</a>`:'<span></span>'}${n<allVerses.length?`<a class="next" href="#bayt/${n+1}">${words.next}${icon('arrow','directional')}</a>`:''}</nav>${footer()}`;
    } catch {
      if(location.hash!==requestHash)return;
      target.innerHTML=`<section class="paper error-panel"><h1>${words.error}</h1><button class="button article-retry">${words.retry}</button></section>`;
      target.querySelector('.article-retry').addEventListener('click',()=>renderArticle(n,target));
    }
  }
  const live=document.createElement('div');live.className='copy-status';live.setAttribute('role','status');live.setAttribute('aria-live','polite');document.body.append(live);
  const dialog=document.createElement('dialog');dialog.className='copy-dialog';dialog.setAttribute('aria-labelledby','manual-copy-title');
  dialog.innerHTML=`<h2 id="manual-copy-title">${words.manual}</h2><textarea readonly aria-label="${ar?'النص المراد نسخه':'Texte à copier'}"></textarea><form method="dialog"><button class="button">${words.close}</button></form>`;document.body.append(dialog);
  function fallback(text){const active=document.activeElement,t=document.createElement('textarea');t.value=text;t.style.cssText='position:fixed;inset:0;opacity:0;pointer-events:none';t.setAttribute('readonly','');document.body.append(t);t.select();let ok=false;try{ok=document.execCommand('copy')}finally{t.remove();active?.focus({preventScroll:true})}return ok;}
  let timer;
  document.addEventListener('click',async e=>{
    const button=e.target.closest('[data-copy]');if(!button)return;
    const n=Number(button.dataset.number),kind=button.dataset.copy;
    let text;
    button.disabled=true;
    try {
      if(kind==='verse'){const v=getVerse(n);if(v)text=verseText(v,lang);}
      if(kind==='fiche'){const f=fiches.find(f=>f.id===button.dataset.fiche);if(f)text=ficheText(f,lang,`${location.origin}/${lang}/#makhraj/${f.id}`);}
      if(kind==='brief'){const c=getChapter(n);text=c?.[ar?'bodyAr':'bodyFr'];}
      if(kind==='article'){const data=await load(),a=data.find(a=>a.n===n);if(a)text=articleText(a,getVerse(n),lang,`${location.origin}/${lang}/#bayt/${n}`);}
      if(!text)throw Error('Missing copy text');
      const success=await writeClipboard(text,navigator.clipboard,fallback);
      if(success){live.textContent=words.copied;live.classList.add('visible');clearTimeout(timer);timer=setTimeout(()=>{live.classList.remove('visible');live.textContent=''},2200);}
      else {dialog.querySelector('textarea').value=text;dialog.showModal();dialog.querySelector('textarea').select();}
    } catch {live.textContent=words.error;live.classList.add('visible');clearTimeout(timer);timer=setTimeout(()=>live.classList.remove('visible'),4000);}
    finally {button.disabled=false;}
  });
  return {verse,index,renderArticle,label:words.label,briefButton:n=>copyButton('brief',n,words.copyBrief)};
}
