# Security Specification & Threat Model

## Data Invariants
1. **User Identity Invariant**: A user document at `/users/{userId}` can only be created or modified by an authenticated user where `request.auth.uid == userId` or by an administrator.
2. **Diagnosis Attribution**: A crop diagnosis at `/diagnoses/{diagnosisId}` must have `userId == request.auth.uid` during creation.
3. **Ticket Governance**: A farmer can submit a ticket with their own `farmerId == request.auth.uid`. Extension officers and admins can update ticket status and append verified prescriptions and agronomist notes.
4. **Plot Telemetry & Outbreak Safety**: Outbreak alerts can be read by any authenticated user for regional biosecurity, while creation and updates require valid fields and rate-limiting ID size constraints.
5. **No Blind Updates**: All updates must enforce `affectedKeys().hasOnly(...)` guards and type checks.
6. **No Phantom Fields**: Document creates must conform strictly to expected entity properties.
7. **Admin Privilege Escalation Guard**: Role field cannot be elevated arbitrarily by users.

## The Dirty Dozen Payloads (Target Rejection Verification)
1. **Payload 1 (Ghost Field Injection)**: Creating a user with `{ id: "uid1", name: "User", role: "admin", isAdmin: true }` -> REJECTED (isAdmin is not in schema).
2. **Payload 2 (Cross-User Write)**: Writing to `/users/victimUid` with `auth.uid = attackerUid` -> REJECTED.
3. **Payload 3 (ID Poisoning)**: Creating doc with ID of 500 characters containing SQL/XSS strings -> REJECTED by `isValidId()`.
4. **Payload 4 (Unverified Diagnosis Attribution)**: Creating a diagnosis doc with `userId = someoneElse` -> REJECTED.
5. **Payload 5 (Unbounded String Attack)**: Submitting advisory notes of 50,000 characters -> REJECTED by `.size() <= 2000` limit.
6. **Payload 6 (Ticket Status Skipping / Hijacking)**: Non-extension user attempting to arbitrarily change `status` to `VERIFIED_BY_AGENT` without assigned credentials -> REJECTED.
7. **Payload 7 (Timestamp Tampering)**: Sending client-spoofed `createdAt = "1990-01-01"` in a protected server timestamp environment -> REJECTED.
8. **Payload 8 (Outbreak Coordinate Forgery / Out of Bound Severity)**: Submitting severity = "Apocalyptic" (not in enum) -> REJECTED.
9. **Payload 9 (Unauthenticated Read of Private User Data)**: Unauthenticated client querying `/users` -> REJECTED.
10. **Payload 10 (Delete Hijacking)**: Contributor attempting to delete a system plot telemetry record without admin permissions -> REJECTED.
11. **Payload 11 (Federated Round Modification)**: Non-admin trying to rewrite historical sovereign certificate -> REJECTED.
12. **Payload 12 (Blanket List Scraping)**: Unauthenticated visitor querying all tickets without authorization -> REJECTED.
