"""Build self-contained notebook with a CSP hash for its exact inline script."""
import base64,hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
WEB=ROOT/'apps/web'
parts=[]
for name in ['vault.mjs','notebook-store.mjs','notebook-app.js']:
    parts.append((WEB/name).read_text().replace('export async function','async function').replace('export function','function'))
script="'use strict';\n(()=>{\n"+'\n'.join(parts)+'\n})();'
digest=base64.b64encode(hashlib.sha256(script.encode()).digest()).decode()
csp=f"default-src 'none'; script-src 'sha256-{digest}'; style-src 'unsafe-inline'; connect-src 'none'; img-src data:; base-uri 'none'; form-action 'none'; object-src 'none'"
html=(WEB/'notebook-template.html').read_text().replace('/* STYLE */',(WEB/'notebook.css').read_text()).replace('/* SCRIPT */',script).replace('/* CSP */',csp)
(WEB/'notebook.html').write_text(html)
print(f'Built notebook.html ({len(html.encode())} bytes)')
