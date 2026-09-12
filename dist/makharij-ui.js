import {escapeHtml as esc} from './reader-core.mjs';
import {relatedFiches} from './makharij-core.mjs';

export function createMakharij({ar,lang,fiches,chapters,icon,num,footer,verse}) {
  const t = ar ? {
    title:'مخارج الحروف بالصور',intro:'اختر حرفًا، وتأمّل الرسم، ثم اقرأ شرح البيت وطبّق مع معلّمك.',badge:'٢٣ بطاقة • الأبيات ٩–١٩',observe:'لاحظ',enlarge:'تكبير الرسم',close:'إغلاق',copy:'نسخ الشرح',details:'اقرأ الشرح المفصّل',sources:'المراجع',source:'مصدر الرسم',reference:'مرجع الشرح',previous:'البطاقة السابقة',next:'البطاقة التالية',all:'كل البطاقات',select:'اختر الحرف أو المنطقة',poem:'نص المنظومة',verse:'البيت',open:'اكتشف الرسم',linked:'صور مرتبطة بالبيت',missing:'تعذّر تحميل الرسم. يمكنك فتحه من المصدر.',sourceImage:'فتح الصورة الأصلية',hint:'صورة، ثم شرح، ثم تطبيق',chapter:'العودة إلى درس المخارج'
  } : {
    title:'Les points d’articulation en images',intro:'Choisissez une lettre, observez le dessin, puis lisez le commentaire et pratiquez avec votre professeur.',badge:'23 FICHES • VERS 9–19',observe:'À observer',enlarge:'Agrandir le dessin',close:'Fermer',copy:'Copier l’explication',details:'Lire l’explication détaillée',sources:'Les références',source:'Source de l’illustration',reference:'Référence du commentaire',previous:'Fiche précédente',next:'Fiche suivante',all:'Toutes les fiches',select:'Choisir une lettre ou une région',poem:'Le poème',verse:'Vers',open:'Observer le dessin',linked:'Dessins associés au vers',missing:'Le dessin n’a pas pu être chargé. Vous pouvez l’ouvrir à sa source.',sourceImage:'Ouvrir l’image originale',hint:'Voir, comprendre, pratiquer',chapter:'Revenir au chapitre des points d’articulation'
  };
  const allVerses=chapters.flatMap(c=>c.verses);
  const link=f=>`#makhraj/${f.id}`;
  const sourceLink=(url,label)=>`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`;
  const img=f=>`<img class="makhraj-image" src="${esc(f.image)}" width="${f.width}" height="${f.height}" alt="${esc(f[lang].title+' — '+f[lang].observation)}" loading="lazy" decoding="async" dir="ltr">`;
  const related=n=>{
    const list=relatedFiches(fiches,n);
    return list.length?`<nav class="related-fiches" aria-label="${t.linked}"><span>${t.linked}</span>${list.map(f=>`<a href="${link(f)}">${esc(f[lang].title)}</a>`).join('')}</nav>`:'';
  };
  const banner=()=>`<a class="makharij-banner" href="#makharij"><span class="makharij-banner-icon" aria-hidden="true">ق</span><span><small>${t.hint}</small><strong>${t.title}</strong></span>${icon('arrow','directional')}</a>`;
  function renderIndex(target){
    document.title=`${t.title} — ${ar?'الجزرية':'La Jazariyya'}`;
    target.innerHTML=`<div class="breadcrumb"><a href="#9">${t.chapter}</a></div><header class="makharij-heading"><span class="eyebrow">${t.badge}</span><h1>${t.title}</h1><p>${t.intro}</p></header><section class="makharij-grid" aria-label="${t.select}">${fiches.map((f,i)=>`<a class="makharij-card" href="${link(f)}"><span class="makharij-card-number">${num(i+1)}</span>${img(f)}<h2>${esc(f[lang].title)}</h2><span>${t.open} ${icon('arrow','directional')}</span></a>`).join('')}</section>${footer()}`;
  }
  const dialog=document.createElement('dialog');
  dialog.className='makhraj-dialog';dialog.setAttribute('aria-labelledby','makhraj-dialog-title');
  dialog.innerHTML=`<div class="dialog-heading"><h2 id="makhraj-dialog-title"></h2><button class="copy-button" type="button" autofocus>${icon('close')}${t.close}</button></div><div class="makhraj-dialog-picture"></div>`;
  document.body.append(dialog);
  let opener;
  dialog.querySelector('button').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
  dialog.addEventListener('close',()=>{document.body.classList.remove('makhraj-modal-open');if(opener?.isConnected)opener.focus({preventScroll:true})});
  window.addEventListener('hashchange',()=>{if(dialog.open)dialog.close()});
  document.addEventListener('click',e=>{
    const button=e.target.closest('[data-enlarge]');if(!button)return;
    const f=fiches.find(f=>f.id===button.dataset.enlarge);if(!f)return;
    opener=button;dialog.querySelector('h2').textContent=f[lang].title;
    dialog.querySelector('.makhraj-dialog-picture').innerHTML=img(f)+`<p>${sourceLink(f.source.imageUrl,t.sourceImage)}</p>`;
    dialog.showModal();document.body.classList.add('makhraj-modal-open');
  });
  document.addEventListener('error',e=>{
    if(!e.target.matches?.('.makhraj-image'))return;
    e.target.hidden=true;
    const message=document.createElement('p');message.className='makhraj-image-error';message.textContent=t.missing;e.target.after(message);
  },true);
  function renderFiche(id,target){
    const i=fiches.findIndex(f=>f.id===id),f=fiches[i],entry=f[lang];
    document.title=`${entry.title} — ${t.title}`;
    target.innerHTML=`<div class="breadcrumb"><a href="#makharij">${t.all}</a>${icon('chevron','directional')}<span>${esc(entry.title)}</span></div><header class="makharij-heading"><span class="eyebrow">${num(i+1)} / ${num(fiches.length)} · ${t.hint}</span><h1>${esc(entry.title)}</h1></header><details class="makhraj-picker"><summary>${t.select}${icon('chevron')}</summary><nav aria-label="${t.select}">${fiches.map(x=>`<a href="${link(x)}" ${x.id===id?'aria-current="page"':''} aria-label="${esc(x[lang].title)}"><b lang="ar" dir="rtl">${esc(x.letters)}</b><span>${esc(x[lang].title)}</span></a>`).join('')}</nav></details><article class="makhraj-fiche"><section class="paper makhraj-verse"><div class="paper-heading"><h2>${icon('book')}${t.poem}</h2></div>${f.verses.map(n=>verse(allVerses.find(v=>v.n===n))).join('')}</section><div class="makhraj-layout"><figure class="makhraj-figure">${img(f)}<figcaption>${id==='ra'?`<strong>${ar?'الراء المفخمة':'Rāʾ emphatique'}</strong>`:''}<button class="copy-button" type="button" data-enlarge="${f.id}">${icon('plus')}${t.enlarge}</button><span>${t.source} : ${sourceLink(f.source.url,f.source.name)}</span></figcaption></figure><div class="makhraj-reading"><aside class="makhraj-observe"><span class="round-icon">${icon('bulb')}</span><h2>${t.observe}</h2><p class="observation">${esc(entry.observation)}</p>${entry.note?`<p class="makhraj-note">${esc(entry.note)}</p>`:''}<button type="button" class="copy-button" data-copy="fiche" data-fiche="${f.id}">${icon('copy')}${t.copy}</button></aside><section class="makhraj-go-further"><h2>${t.details}</h2>${f.verses.map(n=>`<a href="#bayt/${n}">${t.verse} ${num(n)}${icon('arrow','directional')}</a>`).join('')}</section><details class="makhraj-sources"><summary>${t.sources}</summary><p><strong>${t.reference}</strong><br>${sourceLink(f.reference.url,f.reference[lang])}</p><p><strong>${t.source}</strong><br>${sourceLink(f.source.url,f.source.name)}<br>${sourceLink(f.source.imageUrl,t.sourceImage)}</p></details></div></div></article><nav class="chapter-pagination" aria-label="${t.all}">${i>0?`<a href="${link(fiches[i-1])}">${icon('arrow','directional back')}<span><small>${t.previous}</small><strong>${esc(fiches[i-1][lang].title)}</strong></span></a>`:'<span></span>'}${i<fiches.length-1?`<a class="next" href="${link(fiches[i+1])}"><span><small>${t.next}</small><strong>${esc(fiches[i+1][lang].title)}</strong></span>${icon('arrow','directional')}</a>`:`<a href="#makharij">${t.all}${icon('list')}</a>`}</nav>${footer()}`;
  }
  return {label:t.title,related,banner,renderIndex,renderFiche};
}
