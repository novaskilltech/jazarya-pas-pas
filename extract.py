import ast,json,zipfile,re
from pathlib import Path
from xml.etree import ElementTree as E
src=ast.parse(Path('/workspace/scratch/f361c719f9bd/build_jazariyya_book.py').read_text())
v={}
for n in src.body:
 if isinstance(n,ast.Assign) and isinstance(n.targets[0],ast.Name) and n.targets[0].id in ['CHAPTERS','AR','FR']: v[n.targets[0].id]=ast.literal_eval(n.value)
root=E.fromstring(zipfile.ZipFile('/workspace/scratch/f361c719f9bd/Al_Jazariyya_expliquee_arabe_francais.docx').read('word/document.xml'))
ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
paras=[''.join(p.itertext()) for p in []]
paras=[''.join(t.text or '' for t in p.findall('.//w:t',ns)) for p in root.findall('.//w:p',ns)]
verses={}
for p in paras:
 m=re.match(r'^(\d+)  (.*)',p)
 if m: verses[int(m[1])]=m[2]
verses[109]='عَلَى النَّبِيِّ الْمُصْطَفَى وَآلِهِ … وَصَحْبِهِ وَتَابِعِ مِنْوَالِهِ'
verses={n:re.sub(r'\s*‌?\[خَاتِمَةٌ\].*','',s) for n,s in verses.items()}
chs=[]
for a,b,ar,fr in v['CHAPTERS']:
 chs.append({'id':a,'end':b,'ar':ar,'fr':fr,'bodyAr':v['AR'][a],'bodyFr':v['FR'][a],'verses':[{'n':i,'text':verses[i]} for i in range(a,b+1) if i in verses]})
Path('/workspace/sites/jazariyya/dist/content.json').write_text(json.dumps(chs,ensure_ascii=False))
appendices={'fr':[],'ar':[]}
for table in root.findall('.//w:tbl',ns):
 rows=table.findall('w:tr',ns)
 if len(rows)>10:
  for row in rows[1:]:
   cells=[''.join(t.text or '' for t in cell.findall('.//w:t',ns)) for cell in row.findall('w:tc',ns)]
   if len(cells)==3:
    appendices['fr'].append(cells[0]+' — '+cells[2])
    appendices['ar'].append(cells[2]+' — '+cells[1])
Path('/workspace/sites/jazariyya/dist/glossary.json').write_text(json.dumps(appendices,ensure_ascii=False))
