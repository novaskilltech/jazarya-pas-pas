import fs from 'node:fs';
import path from 'node:path';

const dist='dist',origin='https://jazariyya-pas-a-pas.vercel.app';
const chapters=JSON.parse(fs.readFileSync(path.join(dist,'content.json'),'utf8'));
const articles=JSON.parse(fs.readFileSync(path.join(dist,'articles.json'),'utf8'));
const fiches=JSON.parse(fs.readFileSync(path.join(dist,'makharij.json'),'utf8'));
const glossary=JSON.parse(fs.readFileSync(path.join(dist,'glossary.json'),'utf8'));
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clean=value=>String(value??'').replace(/\[(\d+)\]/g,'').replace(/\s+/g,' ').trim();
const excerpt=value=>{const text=clean(value);return text.length>157?text.slice(0,154).replace(/\s+\S*$/,'')+'…':text};
const routePath=(lang,route)=>{
 const base=`/${lang}/`;
 if(route.type==='contents')return base+'sommaire/';
 if(route.type==='glossary')return base+'glossaire/';
 if(route.type==='illustrations')return base+'makharij/';
 if(route.type==='fiche')return `${base}makhraj/${route.fiche}/`;
 if(route.type==='article')return `${base}bayt/${route.verse}/`;
 if(route.type==='chapter')return `${base}chapitre/${route.id}/${route.mode==='practice'?'pratique/':route.mode==='details'?'details/':''}`;
 return base;
};
const labels={
 ar:{site:'الجزرية خطوة بخطوة',free:'موقع تعليمي مجاني',verse:'البيت',chapter:'الدرس',contents:'فهرس الجزرية',glossary:'مصطلحات التجويد',makharij:'مخارج الحروف بالصور',og:'/og-jazariyya-calm-guide-2026.png',ogAlt:'الجزرية خطوة بخطوة — شرح ميسّر وتطبيق عملي مجانًا',fallback:'شرح ميسّر ومفصّل للمقدمة الجزرية.'},
 fr:{site:'La Jazariyya pas à pas',free:'Site éducatif gratuit',verse:'Vers',chapter:'Chapitre',contents:'Sommaire de la Jazariyya',glossary:'Lexique du tajwīd',makharij:"Les points d’articulation en images",og:'/og-jazariyya-calm-guide-fr-2026.png',ogAlt:'La Jazariyya expliquée pas à pas — guide pratique gratuit',fallback:'Une explication simple et détaillée de la Jazariyya.'}
};
const verseByNumber=new Map(chapters.flatMap(c=>c.verses).map(v=>[v.n,v]));
function metadata(lang,route){
 const l=labels[lang];let title=l.site,description=l.fallback,body='';
 if(route.type==='article'){
  const a=articles.find(x=>x.n===route.verse),entry=a[lang],v=verseByNumber.get(route.verse);
  title=`${entry.title} — ${l.verse} ${route.verse}`;description=excerpt(entry.sections[0].paragraphs[0]);
  body=`<article><p>${l.verse} ${route.verse}</p><h1>${esc(entry.title)}</h1><blockquote lang="ar" dir="rtl">${esc(v.text)}</blockquote>${entry.sections.map(s=>`<section><h2>${esc(s.title)}</h2>${s.paragraphs.map(p=>`<p>${esc(p)}</p>`).join('')}</section>`).join('')}<h2>${lang==='ar'?'المراجع':'Références'}</h2><ol>${a.references.map(r=>`<li><a href="${esc(r.url)}">${esc(r[lang])}</a></li>`).join('')}</ol></article>`;
 }else if(route.type==='fiche'){
  const f=fiches.find(x=>x.id===route.fiche),entry=f[lang];title=`${entry.title} — ${l.makharij}`;description=excerpt(entry.observation+' '+entry.note);
  body=`<article><h1>${esc(entry.title)}</h1><img src="${esc(f.image)}" width="${f.width}" height="${f.height}" alt="${esc(entry.title)}"><p>${esc(entry.observation)}</p>${entry.note?`<p>${esc(entry.note)}</p>`:''}</article>`;
 }else if(route.type==='chapter'){
  const c=chapters.find(x=>x.id===route.id);title=`${c[lang]} — ${l.chapter} ${chapters.indexOf(c)+1}`;description=excerpt(c[lang==='ar'?'summaryAr':'summaryFr']||c[lang==='ar'?'bodyAr':'bodyFr']);
  body=`<article><p>${l.chapter} ${chapters.indexOf(c)+1}</p><h1>${esc(c[lang])}</h1><p>${esc(c[lang==='ar'?'bodyAr':'bodyFr'])}</p>${c.verses.map(v=>`<blockquote lang="ar" dir="rtl">${esc(v.text)}</blockquote>`).join('')}</article>`;
 }else if(route.type==='contents'){
  title=l.contents;description=lang==='ar'?'تصفّح 19 درسًا و109 أبيات مشروحة من المقدمة الجزرية.':'Parcourez 19 chapitres et les 109 vers commentés de la Jazariyya.';
  body=`<h1>${esc(title)}</h1><ol>${chapters.map(c=>`<li><a href="${routePath(lang,{type:'chapter',id:c.id,mode:'read'})}">${esc(c[lang])}</a></li>`).join('')}</ol>`;
 }else if(route.type==='glossary'){
  title=l.glossary;description=lang==='ar'?'تعاريف موجزة لمصطلحات التجويد أثناء دراسة الجزرية.':"Des définitions courtes des termes du tajwīd pour étudier la Jazariyya.";
  body=`<h1>${esc(title)}</h1><ul>${glossary[lang].map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`;
 }else if(route.type==='illustrations'){
  title=l.makharij;description=lang==='ar'?'23 بطاقة مصوّرة لفهم مخارج الحروف وتطبيقها مع معلّم متقن.':"23 fiches illustrées pour comprendre les points d’articulation et pratiquer avec un professeur.";
  body=`<h1>${esc(title)}</h1><ul>${fiches.map(f=>`<li><a href="${routePath(lang,{type:'fiche',fiche:f.id})}">${esc(f[lang].title)}</a></li>`).join('')}</ul>`;
 }else body=`<h1>${esc(l.site)}</h1><p>${esc(l.fallback)}</p>`;
 return{title,description,body,og:l.og,ogAlt:l.ogAlt};
}
function html(lang,route){
 const meta=metadata(lang,route),url=origin+routePath(lang,route),other=lang==='ar'?'fr':'ar',otherUrl=origin+routePath(other,route),dir=lang==='ar'?'rtl':'ltr',locale=lang==='ar'?'ar_AR':'fr_FR',alternateLocale=lang==='ar'?'fr_FR':'ar_AR',fullTitle=meta.title===labels[lang].site?meta.title:`${meta.title} — ${labels[lang].site}`;
 return `<!doctype html>\n<html lang="${lang}" dir="${dir}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#182c34"><title>${esc(fullTitle)}</title><meta name="description" content="${esc(meta.description)}"><link rel="canonical" href="${url}"><link rel="alternate" hreflang="${lang}" href="${url}"><link rel="alternate" hreflang="${other}" href="${otherUrl}"><meta property="og:type" content="${route.type==='article'?'article':'website'}"><meta property="og:site_name" content="${esc(labels[lang].site)}"><meta property="og:locale" content="${locale}"><meta property="og:locale:alternate" content="${alternateLocale}"><meta property="og:url" content="${url}"><meta property="og:title" content="${esc(meta.title)}"><meta property="og:description" content="${esc(meta.description)}"><meta property="og:image" content="${origin+meta.og}"><meta property="og:image:secure_url" content="${origin+meta.og}"><meta property="og:image:type" content="image/png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${esc(meta.ogAlt)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(meta.title)}"><meta name="twitter:description" content="${esc(meta.description)}"><meta name="twitter:image" content="${origin+meta.og}"><meta name="twitter:image:alt" content="${esc(meta.ogAlt)}"><link rel="stylesheet" href="/workbook.css"><link rel="stylesheet" href="/makharij.css"><script type="module" src="/reader.js"></script></head><body><a href="${routePath(lang,{type:'contents'})}">${esc(labels[lang].contents)}</a><main>${meta.body}</main><footer>${esc(labels[lang].free)} · Copyright © NovaSkill Tech 2026</footer></body></html>\n`;
}
const routes=[{type:'contents'},{type:'glossary'},{type:'illustrations'}];
for(const c of chapters)for(const mode of ['read','details','practice'])routes.push({type:'chapter',id:c.id,mode});
for(const a of articles)routes.push({type:'article',verse:a.n});
for(const f of fiches)routes.push({type:'fiche',fiche:f.id});
for(const lang of ['ar','fr']){
 fs.writeFileSync(path.join(dist,lang,'index.html'),html(lang,{type:'home'}));
 for(const route of routes){const target=path.join(dist,routePath(lang,route),'index.html');fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,html(lang,route));}
}
const urls=['/',...['ar','fr'].flatMap(lang=>['/'+lang+'/',...routes.map(route=>routePath(lang,route))])];
fs.writeFileSync(path.join(dist,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(url=>`<url><loc>${origin+url}</loc></url>`).join('')}</urlset>\n`);
fs.writeFileSync(path.join(dist,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
console.log(`Generated ${routes.length*2+2} localized pages and ${urls.length} sitemap URLs.`);
