import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {chapterGroups,resolveRoute,splitParagraphs,completionCount,escapeHtml} from './dist/reader-core.mjs';
const chapters=JSON.parse(fs.readFileSync('dist/content.json','utf8'));
const previous=JSON.parse(execFileSync('git',['show','HEAD:dist/content.json'],{encoding:'utf8'}));
const normalize=s=>s.replace(/\s+/g,' ').trim();
assert.equal(chapters.length,19);
assert.equal(chapters.flatMap(c=>c.verses).length,109);
assert.deepEqual(chapters.flatMap(c=>c.verses.map(v=>v.n)),Array.from({length:109},(_,i)=>i+1));
assert.deepEqual(chapterGroups.flatMap(g=>chapters.slice(g.start,g.end).map(c=>c.id)),chapters.map(c=>c.id));
for(const [i,c] of chapters.entries()){
 assert.deepEqual(c.verses,previous[i].verses);
 for(const field of ['bodyAr','bodyFr']){
  assert.equal(c[field],previous[i][field]);
  assert.equal(normalize(splitParagraphs(c[field]).join(' ')),normalize(c[field]));
 }
 assert.ok(c.summaryAr&&c.summaryFr);
 assert.deepEqual(resolveRoute('#'+c.id,chapters),{type:'chapter',id:c.id,mode:'read'});
 assert.deepEqual(resolveRoute('#'+c.id+'/pratique',chapters),{type:'chapter',id:c.id,mode:'practice'});
}
assert.equal(resolveRoute('#sommaire',chapters).type,'contents');
assert.equal(resolveRoute('#glossaire',chapters).type,'glossary');
for(const bad of ['','#invalid','#999','#1/unknown','#<script>'])assert.equal(resolveRoute(bad,chapters).id,1);
assert.equal(completionCount([true,false,true,false]),2);
assert.equal(completionCount([false,false,false,false]),0);
assert.equal(completionCount([true,true,true,true]),4);
assert.equal(escapeHtml('<script>'), '&lt;script&gt;');
for(const lang of ['fr','ar']){
 const html=fs.readFileSync('dist/'+lang+'/index.html','utf8');
 assert.ok(html.includes('lang="'+lang+'"'));
 if(lang==='ar')assert.ok(html.includes('dir="rtl"'));
 assert.ok(html.includes('type="module"'));
}
for(const entry of ['dist/index.html','dist/fr/index.html','dist/ar/index.html']){
 const html=fs.readFileSync(entry,'utf8');
 for(const m of html.matchAll(/(?:href|src)="(\/[^"#]*)"/g)){
  let local=path.join('dist',m[1]);if(m[1].endsWith('/'))local=path.join(local,'index.html');assert.ok(fs.existsSync(local),local);
 }
}
const gloss=JSON.parse(fs.readFileSync('dist/glossary.json'));
assert.equal(gloss.fr.length,20);assert.equal(gloss.ar.length,20);
console.log('PASS: 19 chapters, 109 preserved verses, both languages, 38 chapter routes, glossary, summaries, paragraph integrity, entrypoints and checklist calculations.');
