# Identity, recovery and privacy — design boundary

Authentication, authorship and encryption are three separate concerns.

1. **Create a presence:** choose a handle; generate a portable participant UUID.
2. **Anchor this device:** future WebAuthn registration binds a passkey to the
   site's relying party. Server challenges and verification are required.
3. **Protect authorship:** a separate signing key binds portable contributions
   to the presence. Public key verification alone does not establish that binding.
4. **Protect private material:** separately managed encryption keys protect
   dream payloads. Do not assume a passkey exports a generic encryption key.
5. **Recovery:** enroll a second authenticator and provide an encrypted recovery
   archive for identity/encryption material. Require recovery verification before
   presenting recovery as complete. No email or SMS dependency is proposed.

Passkeys are relying-party scoped; moving hosts does not automatically move
authentication credentials. Portable signing identity and an explicit authenticated
re-enrollment process are required. Recovery design must support revocation and
key rotation without silently changing historical authorship.

The notebook recovery rehearsal now provides an encrypted archive of private
records and a UUID identity; see `RECOVERY_REHEARSAL.md`. It does not yet include
portable signing-key generation, passkey implementation or authenticated identity
recovery. Do not accept real participant secrets yet. Handle-only presence
records and synthetic examples are not accounts.

## Initial threat model

| Threat | Required response |
| --- | --- |
| Malicious client forges timestamps or lock state | Receipt-backed session reducer |
| Target leaked before reveal | Separate custodian storage, role boundaries, audit |
| Dream changed after lock | Verified salted commitment and immutable report |
| Import impersonates a participant | Verified key binding and revocation history |
| Host reads private dreams | Client encryption; key material kept off host |
| Malicious browser script steals keys | CSP, dependency review, isolation; encryption alone is insufficient |
| Graph exposes identity or sensitive relationships | Private-by-default intake and explicit publication preview |
| Cost or storage abuse | Bounded writes, quotas and fail-closed/read-only mode |
| Public data persists after withdrawal | Clear consent, removable primary storage, no automatic public mirrors |

Private/embargoed event metadata still exposes author, time, references and size.
Do not describe the protocol as anonymous or metadata-hiding. Data minimization,
moderation, reporting, consent and retention remain implementation gates.
