# Oneiric Network

An independent public art/research project for dream cartography and blinded
convergence experiments. Working name; initial development is private.

**Experience is admissible; interpretation remains open.**

## Current milestone

Portable data contract **0.1.0 draft**: JSON Schema, synthetic examples, an
offline structural/relationship validator, and architecture notes. No hosted
service, authentication implementation, cryptographic verification, or public
participant intake exists yet. A schema-valid record is not verified evidence.

## Validate locally

Python 3.10 or newer:

```sh
python -m venv .venv
# POSIX: source .venv/bin/activate
# Windows PowerShell: .venv\Scripts\Activate.ps1
python -m pip install -r requirements-dev.txt
python tools/validate.py examples/synthetic-bundle.json
python -m unittest discover -s tests -v
```

Validation performs no network requests. Installation needs package access once.

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

## Constraints

- No Uniflora or Discord dependency.
- Hard $0 developer budget; no paid services, hosted CI, or deployment configured.
- Keep raw reports, interpretations, target comparisons and personal meaning separate.
- Retain misses, controls, nulls and contradictions.
- Never infer paranormal certainty from similarity or subjective resonance.
- No real dream reports, credentials, private keys or recovery files in Git.

The project is intended to be open source. License selection is pending; this
initial repository does not yet grant an open-source license. Participant data
licensing and publication consent will be separate from the code license.
