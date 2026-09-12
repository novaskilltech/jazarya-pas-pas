"""Build the bilingual per-verse commentary from its editable Markdown sources."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
sources = json.loads((ROOT / 'content/sources.json').read_text())
chapters = json.loads((ROOT / 'dist/content.json').read_text())
verses = {v['n']: v for c in chapters for v in c['verses']}


def pages(value):
    return [int(x.strip()) for x in value.split(',')]


def linked_reference(kind, selected, ar, fr):
    records = [sources[kind][str(p)] for p in selected]
    locators = '، '.join(str(r['printedPage']) for r in records)
    return {'ar': f'{ar}، ص {locators}.',
            'fr': f'{fr}, p. {", ".join(str(r["printedPage"]) for r in records)}.',
            'url': records[0]['url'],
            'links': [{'ar': f'ص {r["printedPage"]}', 'fr': f'p. {r["printedPage"]}',
                       'url': r['url']} for r in records[1:]]}


articles = []
for filename in sorted((ROOT / 'content').glob('articles-*.md')):
    for chunk in re.split(r'^@@ ', filename.read_text(), flags=re.M)[1:]:
        lines = chunk.strip().splitlines()
        n = int(lines.pop(0))
        metadata = {}
        sections = {'ar': [], 'fr': []}
        lang = None
        for line in lines:
            line = line.strip()
            if not line:
                continue
            if line in ['### العربية', '### Français']:
                lang = 'ar' if line == '### العربية' else 'fr'
            elif line.startswith('#### '):
                sections[lang].append({'title': line[5:], 'paragraphs': []})
            elif lang:
                sections[lang][-1]['paragraphs'].append(line)
            else:
                key, value = line.split(':', 1)
                metadata[key] = value.strip()
        assert n in verses, (filename, n)
        opening = verses[n]['text'].split('…')[0].strip()
        classic = {
            'ar': f'ملا علي القاري، المنح الفكرية شرح المقدمة الجزرية، شرح «{opening}». الطبعة المصورة التي بهامشها الدقائق المحكمة لزكريا الأنصاري.',
            'fr': f'Mullā ʿAlī al-Qārī, al-Minaḥ al-fikriyya, commentaire de « {opening} ». Édition numérisée portant en marge ad-Daqāʾiq al-muḥkama de Zakariyyā al-Anṣārī.',
            'url': 'https://archive.org/details/0743Pdf_201804', 'links': []}
        if 'QARI' in metadata:
            qp = pages(metadata['QARI'])
            classic['url'] = f'https://ketabonline.com/ar/books/40776/read?page={qp[0]}&part=1'
            classic['ar'] += f' الصفحات الإلكترونية: {", ".join(map(str, qp))}.'
            classic['fr'] += f' Pages de la transcription numérique : {", ".join(map(str, qp))}.'
            classic['links'] = [{'ar': f'الصفحة الإلكترونية {p}', 'fr': f'Page numérique {p}',
                                 'url': f'https://ketabonline.com/ar/books/40776/read?page={p}&part=1'} for p in qp[1:]]
        refs = [classic, linked_reference('salem', pages(metadata['SALEM']),
            'صفوت محمود سالم، فتح رب البرية شرح المقدمة الجزرية في علم التجويد، دار نور المكتبات، ط 2، 1424هـ/2003م',
            'Ṣafwat Maḥmūd Sālim, Fatḥ Rabb al-bariyya, Dār Nūr al-Maktabāt, 2e éd., 1424 H/2003')]
        if 'CRITICAL' in metadata:
            refs.append(linked_reference('qasim', pages(metadata['CRITICAL']),
                'المقدمة الجزرية، تحقيق عبد المحسن بن محمد القاسم، ط 2، 1441هـ/2020م، حواشي الخاتمة',
                'Al-Muqaddima al-Jazariyya, éd. critique de ʿAbd al-Muḥsin al-Qāsim, 2e éd., 1441 H/2020, notes de conclusion'))
        article = {'n': n, 'ar': {'title': metadata['AR'], 'sections': sections['ar']},
                   'fr': {'title': metadata['FR'], 'sections': sections['fr']}, 'references': refs}
        for language in ['ar', 'fr']:
            assert len(sections[language]) >= 3, (n, language)
            for section in sections[language]:
                assert section['paragraphs'], (n, language, section)
                for paragraph in section['paragraphs']:
                    for ref in re.findall(r'\[(\d+)\]', paragraph):
                        assert 1 <= int(ref) <= len(refs), (n, ref)
        articles.append(article)

assert [a['n'] for a in articles] == list(range(1, 110)), 'Missing or duplicate articles'
(ROOT / 'dist/articles.json').write_text(json.dumps(articles, ensure_ascii=False, separators=(',', ':')) + '\n')
print(f'Built {len(articles)} articles in Arabic and French.')
