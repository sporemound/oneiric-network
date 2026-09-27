# Recovery rehearsal v1

Open `apps/web/notebook.html` in a browser that supports Web Crypto and IndexedDB.
This is a self-contained client with no remote assets, network calls or server.
Local-file support varies; a trusted HTTPS or localhost installation is the
alternative. Do not upload private backups to an unfamiliar mirror.

Use fictional test material during this milestone. It is not security-audited,
and visual browser QA is still outstanding. Existing Network/Atlas work remains
available separately in `apps/web/index.html`.

## The full rehearsal

1. Create a notebook with a fictional name and a long, unique passphrase.
2. Save two different original reports. Add a separate annotation to one.
3. Download an encrypted backup, then reopen the actual downloaded file using
   **Reopen and verify**. Verification requires exact current notebook contents.
4. Open a trusted copy of `notebook.html` in a different browser/profile with
   empty storage. The original installation can be closed or unavailable.
5. Restore the backup with its passphrase. Check the two reports and annotation.
6. Choose one original report under **Prepare a public selection**, enter a
   public name, and inspect the exact JSON. Approve the explicit disclosure.
7. Export public JSON and/or the readable public HTML. These buttons download;
   they do not upload, post, or publish to a host.
8. Open the public JSON in **Read a public snapshot** on another installation,
   or open the standalone public HTML. Confirm private notes are absent.

Creating/restoring never overwrites an occupied notebook. This version does not
offer deletion or merge. Keep the original backup until recovery is verified.
Closing or locking discards unsaved form drafts; saved originals are immutable
within this UI and later annotations are separate records.

## Encrypted storage format

The local IndexedDB database holds one encrypted blob, identical in format to
the backup. No plaintext notes or passphrase are stored by application code.

`oneiric-notebook-backup`, version 1:

- PBKDF2-HMAC-SHA-256, exactly 600,000 iterations.
- Fresh random 16-byte salt and 12-byte GCM IV for every encryption.
- AES-256-GCM with 128-bit tag appended to ciphertext.
- AAD: UTF-8 `oneiric:notebook-backup:1`.
- Salt, IV and ciphertext: canonical unpadded base64url.
- Maximum input backup: 8 MiB; plaintext notebook: 4 MiB; 500 reports.
- Fixed KDF parameters: imported files cannot request arbitrary work factors.

The encrypted plaintext is `oneiric-notebook`, version 1, with a stable identity
UUID and handle, revision number, and reports with individual annotation arrays.
`vault.mjs` validates exact fields, IDs, sizes and timestamps before storage and
after decryption. This container is distinct from a public research event bundle;
it does not redefine the event schema's encrypted-payload profile.

The passphrase derives encryption material. It is **not a website password** and
is never sent to a server. PBKDF2 is used to keep this rehearsal compatible with
browser-native Web Crypto; this choice does not constitute a cryptographic audit.
Weak passphrases remain vulnerable to offline guessing. There is no reset.

Sources informing the implementation:

- https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/deriveKey
- https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/encrypt
- https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html

## Identity and publication boundary

Recovery preserves a UUID-based notebook identity. **No signing key, passkey,
key rotation, authentication service or verified authorship is implemented.**
Do not treat possession of an author UUID in a public file as proof of identity.
Cryptographic identity recovery is a subsequent milestone.

Publication uses an allowlist: public handle, author UUID, selected original
text, original author-reported timestamps and newly generated public event IDs.
Private titles, notebook handle, annotations, unselected reports, private report
IDs and keys are excluded. Reusing the author UUID can link public selections;
the review screen explicitly discloses it. An excerpt editor is not implemented:
the complete selected original text is exported, exactly as previewed.

Public JSON conforms to the existing v0.1 bundle/event schema. The narrow public
reader accepts only this milestone's presence-plus-dream snapshot format, not
arbitrary project bundles. Public HTML escapes all report text, contains no
scripts, and has a restrictive CSP. Public export cannot be recalled from holders.

## Reliability and security limits

- IndexedDB read/write transactions compare the expected prior ciphertext
  atomically. Stale tabs fail rather than overwrite. Lock/unlock reloads storage.
- Failed encryption or storage leaves the current form and last saved notebook
  intact. Success is reported only after the storage transaction completes.
- Backup download requests are not represented as confirmed filesystem saves.
  Verification reads the user's downloaded file and compares decrypted contents.
- The encrypted container prevents undetected changes without the key, but
  cannot detect a valid older backup substituted on a fresh installation.
- Private form drafts and unlocked reports exist in memory/DOM. Explicit Lock
  clears application references and UI; secure memory erasure is not guaranteed.
- Encryption does not protect an unlocked page, malware, malicious extensions,
  a compromised client release, screen capture, or operating-system/browser memory.
- Browser storage may be cleared or lost. Backups and passphrase custody remain
  essential. There is no cloud sync, automatic durable backup or guaranteed uptime.
- CSP pins the bundled script by hash and disallows network connections, but a
  malicious replacement HTML file could replace both script and policy. Release
  verification from an independent trusted channel remains future work.
- The rehearsal does not establish experimental timing, anonymity, or blinding.

## Validation

`npm ci` installs development-only test tools. The delivered browser client has
zero runtime dependencies. Run `npm run build` and `npm test`, plus the Python
schema tests. Tests use real Web Crypto and isolated fake IndexedDB installations;
jsdom checks interface flows without claiming browser rendering coverage.

The recovery test closes the first storage instance, restores to an independent
store, compares all records and identity, exports a selected report and checks
private fields are absent. Negative cases cover wrong passphrases, modified
ciphertext, unsupported formats, oversized input, occupied stores, stale writes
and inert rendering of hostile text. Browser/device visual QA and independent
security review remain necessary before real participant intake.
