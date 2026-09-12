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
export function splitParagraphs(text){const s=text.match(/[^.!?。]+[.!?。]+(?:\s|$)|[^.!?。]+$/g)||[text];const p=[];for(let i=0;i<s.length;i+=2)p.push(s.slice(i,i+2).join('').trim());return p;}
export const completionCount=steps=>steps.filter(Boolean).length;
