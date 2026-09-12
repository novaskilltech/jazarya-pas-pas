import assert from 'node:assert/strict';
import fs from 'node:fs';
import {resolveRoute} from './dist/reader-core.mjs';
import {articleText, verseText, verseAttribution, writeClipboard} from './dist/article-core.mjs';

const chapters=JSON.parse(fs.readFileSync('dist/content.json','utf8'));
const articles=JSON.parse(fs.readFileSync('dist/articles.json','utf8'));
const verses=chapters.flatMap(c=>c.verses);
assert.deepEqual(articles.map(a=>a.n),verses.map(v=>v.n));
for(const c of chapters){
  assert.deepEqual(resolveRoute(`#${c.id}/tafsil`,chapters),{type:'chapter',id:c.id,mode:'details'});
  for(const verse of c.verses){
    assert.deepEqual(resolveRoute(`#bayt/${verse.n}`,chapters),{type:'article',id:c.id,verse:verse.n});
    const article=articles.find(a=>a.n===verse.n);
    for(const lang of ['ar','fr']){
      const e=article[lang],url=`https://example.com/${lang}/#bayt/${verse.n}`;
      assert.ok(e.title&&e.sections.length>=3);
      const copied=articleText(article,verse,lang,url);
      assert.ok(copied.includes(verse.text)&&copied.endsWith(url));
      for(const s of e.sections){
        assert.ok(s.title&&s.paragraphs.length);
        for(const p of s.paragraphs){
          assert.ok(copied.includes(p));
          for(const ref of p.matchAll(/\[(\d+)\]/g))assert.ok(article.references[Number(ref[1])-1]);
        }
      }
      for(const ref of article.references){
        assert.ok(ref[lang]&&copied.includes(ref.url));
        const u=new URL(ref.url);assert.equal(u.protocol,'https:');
        assert.ok(['archive.org','ketabonline.com','shamela.ws'].includes(u.hostname));
        for(const p of ref.links||[])assert.ok(copied.includes(p.url)&&p[lang]);
      }
      if([107,109].includes(verse.n)){
        assert.ok(copied.includes(verseAttribution(verse.n,lang)));
        assert.ok(verseText(verse,lang).includes('https://shamela.ws/book/581/95'));
      }else assert.equal(verseText(verse,lang),verse.text);
    }
  }
}
for(const hash of ['#bayt/0','#bayt/110','#bayt/no','#bayt/1/extra'])assert.equal(resolveRoute(hash,chapters).type,'chapter');
const sample=articleText(articles[42],verses[42],'ar');
let received, fallbackCalls=0;
assert.equal(await writeClipboard(sample,{writeText:async text=>{received=text}},()=>{fallbackCalls++;return true}),true);
assert.equal(received,sample);assert.equal(fallbackCalls,0);
assert.equal(await writeClipboard(sample,{writeText:async()=>{throw Error('denied')}},text=>{received=text;return true}),true);
assert.equal(received,sample);
assert.equal(await writeClipboard(sample,undefined,()=>false),false);
assert.equal(await writeClipboard(sample,undefined,()=>{throw Error('blocked')}),false);
console.log('PASS: 109 bilingual articles, article and chapter routes, valid citation indexes, complete Unicode copying with every reference, attribution notes and clipboard failure paths.');
