# Work Mode Context Export — Independent Dream Network Art/Research Project

**Status:** Authoritative handoff context  
**Date:** 2026-09-26  
**Project state:** New independent project; no Uniflora or Discord dependency

## 1. Core concept

Build a public experimental art + research website for collective dream-network exploration.

The project should let participants log dreams, optionally participate in blinded target experiments, and explore relationships among:

- participants
- dreams
- timestamps
- motifs
- synchronous and asynchronous correspondences
- real locations
- fictional locations
- imagined locations
- emergent/convergent dream locations
- concealed experimental targets
- later interpretations
- alternative explanations
- statistical/base-rate context

The project is not intended to assert that a literal shared dreamworld, telepathy, precognition, or paranormal mechanism has been established.

Core epistemic principle:

> **Experience is admissible; interpretation remains open.**

The project should preserve raw experience, experimental protocol, interpretation, coincidence, imagination, fiction, intuition, and possible anomalous correspondence as distinguishable layers.

## 2. Independent project decision

This project is now **entirely independent** from:

- Uniflora Discord
- #astral-plane-and-oneirogens
- Discord-native identity
- Discord bots
- Discord as a backend or dependency

It may later interoperate with social systems, but the reference architecture must stand alone.

## 3. Public-art framing

This should function simultaneously as:

1. a public experimental artwork
2. an interactive infographic
3. a collective oneiric atlas
4. a controlled coincidence / convergence laboratory
5. an open-source research instrument

The aesthetic/interaction lineage is similar to the user's prior **Web of Distrust** infographic project: graph-oriented, explorable, layered, time-aware, and capable of revealing relationships rather than presenting a linear article.

Primary site views:

- **Network** — people, dreams, motifs, sessions, targets, places, matches
- **Atlas** — recurrent and emergent dream locations
- **Lab** — blinded experiments, controls, target pools, delayed reveal, statistics, protocol
- optional **Archive** — provenance-preserving event history

## 4. Dream-location ontology

Location classes should be first-class entities, not loose tags:

### Real
A geographic location that exists outside the experiment.

### Fictional
A shared cultural location originating in film, literature, games, art, folklore, etc.

### Imagined
A participant-generated place with no required shared external referent.

### Emergent / convergent
A provisional place-node created when independent reports repeatedly overlap in morphology or narrative structure.

An emergent location must not automatically be presented as evidence of a literal shared realm.

Location morphology may evolve through dimensions such as:

- architecture
- biome
- light
- weather
- topology
- inhabitants
- sound
- objects
- emotional valence
- accessibility/pathways
- recurrence
- contradiction

Contradictions should remain visible rather than being silently averaged away.

## 5. Research / experimental structure

A strong experimental protocol uses:

1. **Seed / target commitment**
2. **Dream recording**
3. **Lock**
4. **Delayed reveal**
5. **Comparison**
6. **Control / decoy evaluation**
7. **Interpretation after the fact**

Raw dream text must be immutable once locked.

Important separation:

- what the participant originally reported
- what was added later
- what was machine-extracted
- what was inferred after target reveal

Possible target classes:

- real place
- fictional environment
- generated environment
- image
- phrase
- object
- concealed real-world target
- control/decoy target

Possible experimental conditions:

- synchronous sleep windows
- asynchronous ±1 / ±3 / ±7 day windows
- repeated target exposure
- no target exposure
- pairs
- cohorts
- familiar vs unfamiliar participants
- distinctive vs generic targets
- real vs fictional vs generated targets

## 6. Scoring philosophy

Do **not** create a single “telepathy score.”

Keep separate:

### Descriptive convergence
How similar were reports?

### Experimental evidence
Did the intended target outperform controls/decoys under blinded conditions?

### Subjective resonance
How meaningful did the participant find the correspondence?

### Base-rate rarity
How unusual were the overlapping motifs in the corpus?

Example conceptual surprise measure:

S = -log P(M1, M2, ... Mn | baseline dream corpus)

This is a convergence-surprise statistic, not a paranormal-certainty metric.

Negative evidence must be retained:

- misses
- failed predictions
- common motifs
- control matches
- decoy matches
- null sessions
- ambiguous reports

## 7. Zero-cost constitutional constraint

The project must remain **100% free to the developer** and should also be free to participants.

This is a deliberate artistic and engineering constraint.

Reference implementation must not require payment for:

- hosting
- domains
- API credits
- authentication
- storage
- analytics
- AI inference
- email
- SMS
- CAPTCHA
- object storage
- vector databases
- proprietary SaaS

The preferred behavior at free-tier limits is graceful degradation or temporary read-only behavior — **never accidental billing**.

A custom domain is optional and not required.

## 8. Identity architecture

Avoid traditional passwords if possible.

Preferred approach:

### Primary
**WebAuthn / passkeys**

Store:

- user ID
- public handle
- public credential / public key
- created timestamp
- optional profile metadata

Do not store reusable plaintext secrets.

Private authentication material remains in the user's authenticator/device.

### Optional portability layer
**Nostr-style public/private key identity**

Potential benefits:

- portable pseudonymous identity
- signed contributions
- independently verifiable authorship
- relay-based event transport
- persistence independent of one site

A friendly public handle can sit above a public key.

Nostr should be optional in v0.1 unless it clearly improves UX.

## 9. Secrets and private dream data

Private / embargoed dream material should be encrypted client-side before remote storage when feasible.

Possible model:

plaintext dream
→ browser crypto
→ encrypted ciphertext
→ remote storage

Use browser-native cryptographic primitives where practical.

Potential cryptographic functions:

- Web Crypto API
- SHA-256 commitments
- AES-GCM encrypted payloads
- digital signatures
- deterministic event IDs

A pre-reveal dream commitment may use:

SHA-256(canonical_dream_report + nonce)

Later reveal of plaintext + nonce proves the report existed unchanged before reveal.

## 10. Event/provenance model

Dreams should behave more like immutable events than mutable documents.

Example conceptual event:

- event_id
- author_public_id
- created_at
- sleep_start
- sleep_end
- plaintext or ciphertext
- report_hash
- experiment_session_id
- target_commitment_id
- previous_event / parent_event
- signature
- visibility state
- later annotations

Do not overwrite the original dream event.

Later additions should be separate child events:

- interpretation
- motif extraction
- location hypothesis
- correction
- recollection
- public annotation

This preserves provenance.

## 11. Recommended free stack

Preferred v0.1 stack:

### Frontend
- Vite
- TypeScript
- static-first architecture

### Hosting/API
- Cloudflare Pages / Workers or equivalent free static/serverless tier

### Database
- Cloudflare D1 or equivalent free database

### Anti-abuse
- Cloudflare Turnstile or another genuinely free option

### Identity
- WebAuthn / passkeys
- optional Nostr bridge

### Cryptography
- Web Crypto API
- SHA-256
- AES-GCM
- signatures

### Portable protocol
- JSON event schema
- signed events where appropriate

### Decentralized mirror
- optional Nostr relay publication

### Archival/export
- IPFS-compatible export / CAR or content-addressed archive format
- do not assume IPFS pinning is permanently free

## 12. IPFS caveat

IPFS must not be treated as magical permanent free storage.

Use it only as:

- public archival mirror
- content-addressed export
- optional community pinning layer

Private content must be encrypted before any public-content-addressed publication.

Primary operational storage should remain replaceable.

## 13. Hosting portability principle

The project should survive migration between free hosts.

Avoid binding the core data model to one vendor.

Define:

- portable JSON schemas
- import/export
- signed event records
- deterministic IDs where useful
- static snapshots
- offline analysis tools

A participant's identity and public contribution history should ideally remain portable even if the canonical site disappears.

## 14. Login/art direction

Avoid ordinary SaaS wording where possible.

Instead of:

- Create account
- Email
- Password

Prefer an artistic identity flow such as:

- **Create a presence**
- choose a public name
- anchor this presence to this device
- export recovery identity if desired

The interaction should feel native to the artwork while remaining understandable and secure.

## 15. Inuit / sila research context

Earlier discussion explored Inuit concepts including:

- sila
- angakkuq traditions
- qaumaneq
- dream knowledge
- relational epistemology
- intuition
- environment-person relations

Important constraint:

Do **not** appropriate Inuit concepts as game mechanics, visual branding, or generalized “psychic” terminology.

If included, they should appear in a carefully sourced comparative-epistemology/research section, attributed to specific communities and scholars.

The conceptual lesson worth carrying forward is:

> person, environment, relationship, experience, and interpretation can be represented as interconnected without pretending they are identical.

Do not claim that Inuit traditions validate telepathy or shared-dream hypotheses.

## 16. Design principles

- graph-first exploration
- chronology matters
- pre-reveal and post-reveal states visibly distinct
- raw data and interpretation visibly distinct
- positive and negative results equally accessible
- mobile-friendly
- public art aesthetic rather than enterprise dashboard aesthetic
- no dark-pattern engagement
- no paid-user features
- no leaderboard of “psychic ability”
- no gamified certainty
- preserve ambiguity
- make provenance inspectable

## 17. Data entities

Likely v0.1 entities:

- Participant
- PublicHandle
- Credential
- DreamEvent
- DreamRevision / Annotation
- Session
- Target
- TargetPool
- TargetCommitment
- Motif
- MotifOccurrence
- Place
- PlaceMorphology
- PlaceOccurrence
- Match
- ControlMatch
- ExperimentCondition
- VisibilityRule
- Signature
- ExportBundle

## 18. Immediate Work-mode goals

Start by treating this file as the authoritative project context.

Recommended next tasks:

1. choose a final working project name or maintain a temporary codename
2. initialize/create a new **private GitHub repository**
3. define the architecture as vendor-portable
4. formalize the v0.1 event/data schema
5. formalize authentication and recovery UX
6. establish a hard zero-cost budget policy
7. implement a static interactive Network/Atlas/Lab prototype
8. add blinded seed → dream → lock → reveal experiment flow
9. design import/export so project data is not trapped in one host
10. create threat model and privacy model before accepting public users

## 19. Current working name

Previous temporary working name: **Oneiric Network**

This is explicitly provisional and can be changed without preserving branding.

## 20. Source-of-truth instruction for next session

When this context conflicts with earlier Uniflora/Discord ideas, **this document wins**.

The project is now:

> an independent, public, zero-cost, open-source experimental art/research network for dream cartography, blinded convergence experiments, and provenance-preserving exploration of synchronous/asynchronous real, fictional, imagined, and emergent locations.

