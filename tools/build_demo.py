"""Build a zero-dependency, offline-openable HTML prototype from portable events."""
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
WEB=ROOT/'apps/web'
def inline_json(path):
    return json.dumps(json.loads(path.read_text()),ensure_ascii=False).replace('<','\\u003c')
html=(WEB/'template.html').read_text()
html=html.replace('/* STYLES */',(WEB/'style.css').read_text())
html=html.replace('/* WORLD */',inline_json(ROOT/'examples/miniature-world.json'))
html=html.replace('/* LAYOUT */',inline_json(WEB/'layout.json'))
model=(WEB/'model.mjs').read_text().replace('export function','function')
html=html.replace('/* SCRIPT */',"'use strict';\n(()=>{\n"+model+'\n'+(WEB/'app.js').read_text()+'\n})();')
(WEB/'index.html').write_text(html)
print(f'Built {WEB / "index.html"} ({len(html.encode())} bytes)')
