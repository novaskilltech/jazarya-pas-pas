"""Recover the manuscript's existing summaries without modifying the book or matn."""
import ast
import json
from pathlib import Path

root = Path(__file__).parent
tree = ast.parse(Path('/workspace/scratch/f361c719f9bd/build_jazariyya_book.py').read_text())
summaries = {}
for node in ast.walk(tree):
    if isinstance(node, ast.Assign) and isinstance(node.targets[0], ast.Name):
        key = node.targets[0].id
        if key in ('ar_summary', 'fr_summary'):
            value = node.value
            if isinstance(value, ast.Call):
                value = value.func.value
            summaries[key] = ast.literal_eval(value.value)
chapters = json.loads((root/'dist/content.json').read_text())
for c in chapters:
    c['summaryFr'] = summaries['fr_summary'][c['id']].replace('lheastop', 'arrêt')
    c['summaryAr'] = summaries['ar_summary'][c['id']]
(root/'dist/content.json').write_text(json.dumps(chapters, ensure_ascii=False, indent=2)+'\n')
