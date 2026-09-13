export const chapterGroups=[{start:0,end:4},{start:4,end:10},{start:10,end:13},{start:13,end:16},{start:16,end:19}];
export const escapeHtml=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function resolveRoute(hash,chapters,fiches=[]){
 const route=hash.replace(/^#/,'');
 if(route==='sommaire')return{type:'contents'};
 if(route==='glossaire')return{type:'glossary'};
 if(route==='makharij')return{type:'illustrations',id:9};
 const fiche=/^makhraj\/([a-z]+)$/.exec(route);
 if(fiche&&fiches.some(f=>f.id===fiche[1]))return{type:'fiche',id:9,fiche:fiche[1]};
 const article=/^bayt\/(\d+)$/.exec(route);
 if(article){const verse=Number(article[1]),c=chapters.find(c=>c.verses.some(v=>v.n===verse));if(c)return{type:'article',id:c.id,verse};}
 const m=/^(\d+)(?:\/(pratique|tafsil))?$/.exec(route),c=chapters.find(c=>c.id===Number(m?.[1]))||chapters[0];
 return{type:'chapter',id:c.id,mode:m?.[2]==='pratique'?'practice':m?.[2]==='tafsil'?'details':'read'};
}
export function resolveLocation(pathname,hash,chapters,fiches=[]){
 const route=String(pathname||'').replace(/^\/(?:ar|fr)(?:\/|$)/,'').replace(/^\/+|\/+$/g,'');
 if(!route)return resolveRoute(hash,chapters,fiches);
 if(route==='sommaire')return{type:'contents'};
 if(route==='glossaire')return{type:'glossary'};
 if(route==='makharij')return{type:'illustrations',id:9};
 let m=/^makhraj\/([a-z]+)$/.exec(route);
 if(m&&fiches.some(f=>f.id===m[1]))return{type:'fiche',id:9,fiche:m[1]};
 m=/^bayt\/(\d+)$/.exec(route);
 if(m){const verse=Number(m[1]),c=chapters.find(c=>c.verses.some(v=>v.n===verse));if(c)return{type:'article',id:c.id,verse};}
 m=/^chapitre\/(\d+)(?:\/(pratique|details))?$/.exec(route);
 if(m){const c=chapters.find(c=>c.id===Number(m[1]));if(c)return{type:'chapter',id:c.id,mode:m[2]==='pratique'?'practice':m[2]==='details'?'details':'read'};}
 return resolveRoute(hash,chapters,fiches);
}
export function routePath(lang,route){
 const base=`/${lang}/`;
 if(route.type==='contents')return base+'sommaire/';
 if(route.type==='glossary')return base+'glossaire/';
 if(route.type==='illustrations')return base+'makharij/';
 if(route.type==='fiche')return `${base}makhraj/${route.fiche}/`;
 if(route.type==='article')return `${base}bayt/${route.verse}/`;
 if(route.type==='chapter')return `${base}chapitre/${route.id}/${route.mode==='practice'?'pratique/':route.mode==='details'?'details/':''}`;
 return base;
}
export function splitParagraphs(text){const s=text.match(/[^.!?。]+[.!?。]+(?:\s|$)|[^.!?。]+$/g)||[text];const p=[];for(let i=0;i<s.length;i+=2)p.push(s.slice(i,i+2).join('').trim());return p;}
export const completionCount=steps=>steps.filter(Boolean).length;
