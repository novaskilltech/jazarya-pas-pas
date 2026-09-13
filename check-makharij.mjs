import assert from 'node:assert/strict';
import fs from 'node:fs';
import {resolveRoute,resolveLocation} from './dist/reader-core.mjs';
import {ficheText,relatedFiches} from './dist/makharij-core.mjs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const fiches=read('dist/makharij.json'),chapters=read('dist/content.json'),articles=read('dist/articles.json');
assert.equal(fiches.length,23);assert.equal(new Set(fiches.map(f=>f.id)).size,23);
assert.equal(resolveRoute('#makharij',chapters,fiches).type,'illustrations');
const actualVerseNumbers=new Set(chapters.flatMap(c=>c.verses.map(v=>v.n)));
for(const f of fiches){
 const hash='#makhraj/'+f.id;
 for(const lang of ['fr','ar']){
  const localized=new URL('/'+lang+'/'+hash,'https://example.com');
  assert.deepEqual(resolveRoute(localized.hash,chapters,fiches),{type:'fiche',id:9,fiche:f.id});
  assert.deepEqual(resolveLocation(localized.pathname.replace('/#','/')+`makhraj/${f.id}/`,'',chapters,fiches),{type:'fiche',id:9,fiche:f.id});
  assert.ok(f[lang].title&&f[lang].observation);
  const copied=ficheText(f,lang,localized.href);
  for(const required of [f[lang].observation,f.source.url,f.reference.url,localized.href])assert.ok(copied.includes(required));
 }
 for(const n of f.verses){assert.ok(n>=9&&n<=19&&actualVerseNumbers.has(n));assert.ok(articles.find(a=>a.n===n));assert.ok(relatedFiches(fiches,n).includes(f));}
 const image=fs.readFileSync('dist'+f.image);assert.ok(image[0]===0xff&&image[1]===0xd8||image[0]===0x89&&image.subarray(1,4).toString()==='PNG');assert.ok(f.width>300&&f.height>300);
 for(const url of [f.source.url,f.source.imageUrl,f.reference.url])assert.equal(new URL(url).protocol,'https:');
}
for(let n=9;n<=19;n++)assert.ok(relatedFiches(fiches,n).length>0);
for(const hash of ['#makhraj/missing','#makhraj/<script>','#makhraj/qaf/extra'])assert.equal(resolveRoute(hash,chapters,fiches).type,'chapter');
for(const n of [1,8,20,109])assert.equal(relatedFiches(fiches,n).length,0);
for(const entry of ['dist/index.html','dist/fr/index.html','dist/ar/index.html'])assert.ok(fs.readFileSync(entry,'utf8').includes('/makharij.css'));
console.log('PASS: 23 illustrated fiches, FR/AR routes, every verse 9–19 linked to its commentary, Unicode copy with sources, all local images present and valid, invalid routes handled.');
