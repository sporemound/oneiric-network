# Architecture decision 001 — portable events first

Status: proposed v0.1 foundation; no hosting vendor selected.

The event contract owns data meaning. Storage adapters own persistence; neither
database row IDs nor hostname-dependent URLs are participant or event identity.

Planned boundaries:

| Component | Responsibility |
| --- | --- |
| `schemas/` (implemented) | Versioned JSON contracts, independent of runtime |
| `tools/`, `tests/` (implemented) | Offline validation and failure cases |
| Future `packages/protocol/` | Validated types, canonicalization, cryptography, imports |
| Future `packages/projections/` | Rebuildable Network / Atlas / Lab views |
| Future `apps/web/` | Static-first Vite/TypeScript interface |
| Future `adapters/` | Local persistence, optional server and database integrations |

Do not create placeholder services or divide the initial app into microservices.
Implement only when a user-visible flow needs the boundary.

## Storage and portability

Events are immutable at the protocol layer. A database may index them, but the
exported event bytes/meaning and provenance must survive replacement of the host.
Projections can be rebuilt. New annotation events never replace a raw dream.

Use UUIDs for stable references. Cryptographic content digests are separate from
event IDs, preventing migration or proof attachment from changing references.
The schema URNs identify local contracts; they are not endpoints to contact.

Exports contain events plus an explicit list of omitted dependencies. Public
exports must exclude private/embargoed events, even ciphertext and references
that would expose them. Owner exports retain sensitive payloads encrypted.
Neither export automatically contains credentials, key material or assets.

## Zero-cost boundary

Current validation is local. No deployment, billing account, metered backend,
analytics, external AI, email, SMS or GitHub Actions workflow is configured.
Free-tier services must be evaluated before adoption; indefinite vendor free
availability cannot be promised. Require explicit quotas, bounded writes,
read-only fallback, export and a replacement-host plan. Never auto-upgrade.

## Next implementation gates

1. Review event vocabulary and select the source-code license.
2. Add cross-language JCS digest/signature/commitment test vectors and encryption.
3. Implement identity keys, authenticated binding, recovery and revocation.
4. Implement session reducer, receipt-backed chronology, allocation and blinding.
5. Build local-first Network / Atlas / Lab with synthetic data and exports.
6. Threat-model, consent, moderation and deletion review before public intake.
