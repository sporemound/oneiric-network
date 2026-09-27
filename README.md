# Oneiric Network

An independent public art/research project for dream cartography and blinded
convergence experiments. Working name.

**Experience is admissible; interpretation remains open.**

## Current milestone

An offline **Network / Atlas miniature world** built on portable data contract
**0.1.0 draft**: JSON Schema, synthetic examples, an offline
structural/relationship validator, and architecture notes. An encrypted
private-notebook recovery rehearsal is also implemented. No hosted service,
authentication implementation, event-signature verification, or public participant
intake exists yet. A schema-valid record is not verified evidence.

## Rehearse private notebook recovery

Open [`apps/web/notebook.html`](apps/web/notebook.html) from a downloaded trusted
copy. Use fictional test notes: create a notebook, save an original report and a
separate annotation, download and verify its encrypted backup, then restore into
an empty browser/profile. Explicitly select original reports for public JSON or
HTML export. Nothing is uploaded.

See [`docs/RECOVERY_REHEARSAL.md`](docs/RECOVERY_REHEARSAL.md) for the walkthrough,
encryption format and limitations. The notebook UUID is portable but unsigned;
cryptographic identity, independent security review and visual browser QA remain
outstanding. Browser support for Web Crypto and IndexedDB is required.

## Explore the miniature world

Open [`apps/web/index.html`](apps/web/index.html) in your browser. The checked-in
file runs offline: 20 fictional reports, five places, inspectable connections,
contradictions and a five-day chronology. Download the file or repository first;
GitHub's source viewer does not run the page.

See [`docs/MINIATURE_WORLD.md`](docs/MINIATURE_WORLD.md) for scope and rebuilding.
This is synthetic material only, with no participant intake or hosted service.

## Validate locally

Python 3.10 or newer:

```sh
python -m venv .venv
# POSIX: source .venv/bin/activate
# Windows PowerShell: .venv\Scripts\Activate.ps1
python -m pip install -r requirements-dev.txt
python tools/validate.py examples/synthetic-bundle.json
python -m unittest discover -s tests -v
node --test tests/test_projection.mjs
```

Validation performs no network requests. Installation needs package access once.
For recovery, storage and interface tests, install development-only Node
dependencies with `npm ci`, then run `npm run build` and `npm test`. The delivered
HTML clients have no runtime dependencies or remote asset requests.

## Contents

| Path | Purpose |
| --- | --- |
| `schemas/v0.1/event.schema.json` | Typed events and encrypted payload envelope |
| `schemas/v0.1/bundle.schema.json` | Portable import/export container |
| `docs/SCHEMA.md` | Identity, event semantics and normative constraints |
| `docs/ARCHITECTURE.md` | Boundaries and next implementation steps |
| `docs/IDENTITY_PRIVACY.md` | Authentication, recovery and privacy design |
| `docs/PROJECT_CONTEXT.md` | Supplied authoritative project brief |
| `examples/` | Synthetic records only |
| `apps/web/` | Offline Network / Atlas prototype and display projection |
| `apps/web/notebook.html` | Encrypted notebook, recovery rehearsal and public snapshot reader |

## Constraints

- Hard $0 developer budget; no paid services, hosted CI, or deployment configured.
- Keep raw reports, interpretations, target comparisons and personal meaning separate.
- Retain misses, controls, nulls and contradictions.
- Never infer paranormal certainty from similarity or subjective resonance.
- No real dream reports, credentials, private keys or recovery files in Git.

