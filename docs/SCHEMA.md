# Portable schema 0.1.0 — draft contract

## Representation

JSON Schema Draft 2020-12; UTF-8 JSON; UUID identifiers; UTC RFC 3339 timestamps
ending in `Z`. Validators must enable format checks. Unknown fields fail closed.
Future incompatible contracts receive new version identifiers; historical events
retain their original contract. Importers quarantine unsupported versions.

`header` contains a stable event UUID, portable author UUID, author-claimed
creation time, publication intent and typed references. `payload` is a tagged
union. `attestations` is optional for unsigned local drafts; present attestations
require a content digest and signatures. Import must never relabel unsigned
events as verified. Presence UUIDs and public handles are not authentication.

## Payload meanings

| Kind | Meaning |
| --- | --- |
| presence | Public pseudonymous profile; handle need not be globally unique |
| dream | Raw report and optional estimated/recorded sleep window |
| annotation | Separate interpretation, recollection, correction or extraction |
| place | Real, fictional, imagined or emergent hypothesis |
| place_observation | Source-backed morphology with support/contradiction/uncertainty |
| motif_observation | Source-backed motif, origin, exposure and method |
| session | Protocol, deadlines, allocation, blinding, controls, scoring and stopping rule |
| commitment | Salted digest for a dream, target or target pool |
| lock | Reference to a dream commitment in a session |
| reveal | Explicit commitment opening; raw content and nonce revealed together |
| evaluation | One descriptive, experimental, subjective or rarity axis |
| withdrawal | Request to withdraw an event from served projections |
| encrypted | Opaque envelope containing one of the above typed payloads |

Emergent places are provisional interpretive entities. Observations with
different or contradictory values coexist; projections must not silently average
them. Place definitions are attributed assertions, not privileged external truth.

## Cryptographic profile (specified; not implemented here)

Canonicalization: RFC 8785 JCS, without Unicode normalization. Reject duplicate
JSON keys, non-finite numbers and invalid Unicode. Never hash pretty-printed JSON
or assume a generic sorted-key encoder implements JCS.

Event digest:

```
sha256(UTF8("oneiric:event:0.1\n") || JCS({header, payload}))
```

Store as `sha256:` plus 64 lowercase hex characters. Attestations are excluded
to avoid self-reference. Ed25519 signatures sign the 32 raw digest bytes;
public keys and signatures are unpadded base64url. Verify digest, signature,
author-key binding, revocation and key history independently. A self-supplied
public key does not prove ownership of an author UUID. Key-binding and receipt
records are reserved for a later schema revision, before network acceptance.

Commitment digest:

```
sha256(UTF8("oneiric:commitment:0.1\n") ||
       JCS({session_id, subject, opening}))
```

`opening` has `kind`, a fresh cryptographically random 32-byte `nonce` encoded
as unpadded base64url, and typed `value`. `subject` must equal `opening.kind`.
The nonce remains secret until reveal. Including the session and subject prevents
cross-session/type substitution. A target-pool commitment covers the entire
ordered pool; allocation and randomization remain separate protocol requirements.

Encryption profile: AES-256-GCM, a unique 12-byte IV per encryption under a key,
128-bit authentication tag appended to ciphertext, unpadded base64url. Plaintext
is JCS of a typed payload. AAD is UTF8(`oneiric:encrypted:0.1\n`) followed by
JCS(header). Never export the encryption key alongside ciphertext. Changing an
authenticated header requires a new event and fresh IV, not editing ciphertext.
Key wrapping/distribution and authenticated recovery are not implemented yet.

## Semantics beyond JSON shape

The included validator checks local references, chronology fields, unique IDs,
reference kinds for key relationships and public-export visibility. It deliberately
does not implement cryptography, authentication, a full session reducer or
experimental validity. A `PASS` means structurally coherent, not trustworthy.

Before accepting network events, the future protocol implementation MUST:

- Verify proofs and author permissions; reject same UUID with different content.
- Use independently recorded receipt times for deadlines. Self-reported clocks
  and hash commitments alone do not establish when a report existed.
- Enforce registration/commitment → recording → lock → reveal → evaluation.
  Lock/reveal events must refer to matching session/subject commitments; locks
  require authorized, timely receipt, and reveals must verify the digest.
- Prevent early target access in client bundles, URLs, logs or exported metadata.
  A purely local demo cannot guarantee blinded experiments against its owner.
- Validate source type and motif span against raw text in Unicode code points.
- Require preregistered method, baseline and multiplicity handling before treating
  evaluations as statistical evidence. No composite telepathy score exists.
- Keep null sessions and omitted observations explicit in research reporting.

## Export and import

A bundle has a version, scope, export time, events and omitted dependency IDs.
Imports are atomic and bounded (prototype validator limit: 16 MiB). No remote
schema retrieval is performed. Unknown or conflicting data is rejected rather
than rewritten. Existing-store collision checks belong to the storage adapter.

Public scope admits public events only. Omitted IDs declare incomplete graphs;
they do not prove the omitted events exist or authorize fetching them. Exporters
must assess whether even an omitted ID reveals private participation.

Immutability preserves evidence, not forced eternal retention. Withdrawal adds
history while hosts may remove protected content from their storage/projections.
Signed public copies cannot be recalled from other holders. Do not publish or
pin personal reports without specific informed consent.

## References

- https://json-schema.org/draft/2020-12
- https://www.rfc-editor.org/rfc/rfc8785

The application choices above are this project's proposed protocol, not guarantees
provided by either specification.
