# BRICS AgriNet: System Architecture & Technical Specifications

**Version:** 2.0 (Enterprise Production Specification)  
**Classification:** Open Agronomic Computing Standard

---

## 1. Architectural Topology

```
+-----------------------------------------------------------------------------------------+
|                                    CLIENT (PWA / React 19)                              |
|                                                                                         |
|  [ Presentation Layer ]                                                                 |
|  - SyncStatusBanner (role="status", aria-live="polite", ICU pluralization)              |
|  - PWAInstallButton (BeforeInstallPromptEvent + iOS Safari guided flow)                 |
|  - LazyErrorBoundary (Dynamic chunk loading fallback with retry action)                 |
|                                     |                                                   |
|                                     v                                                   |
|  [ Hooks & State Orchestration ]                                                        |
|  - useNetworkStatus (Hysteresis: 3-fail offline, 1-success online, exponential backoff) |
|  - useOfflineQueue (Web Locks exclusive leader election, per-entity concurrency)        |
|                                     |                                                   |
|                                     v                                                   |
|  [ Pure Domain Layer (src/domain/**) ]                                                  |
|  - agronomy/fao56 (Penman-Monteith reference ETo engine, psychrometrics)                |
|  - agronomy/npkCalculator (Macronutrient deficit balancing, DAP/Urea/MOP dosing)         |
|  - agronomy/yieldRisk (Biophysical stress survival modeling, [0, 100]% bounded)          |
|  - telemetry/clustering (Haversine distance, order-independent spatial clustering)      |
|  - offline/queue (Pure transitions, max-retry DLQ rules, per-entity FIFO)               |
|  - security/redaction (PII masking, token expiry check, coordinate fuzzing)             |
|                                     |                                                   |
|                                     v                                                   |
|  [ Infrastructure Adapters (src/infrastructure/**) ]                                    |
|  - IndexedDbStorageAdapter (idb, persistent storage negotiation, Blob photos)           |
|  - WebCryptoStorage (AES-GCM-256 at-rest encryption for sensitive coordinates)          |
|  - WebLocksSync (navigator.locks exclusive tab synchronization)                         |
+-----------------------------------------------------------------------------------------+
                                      |
                                      | HTTPS (Headers: Authorization, Idempotency-Key)
                                      v
+-----------------------------------------------------------------------------------------+
|                                BACKEND SERVICE (Express in Node.js)                     |
|                                                                                         |
|  [ Gateway & Resilience Middleware ]                                                    |
|  - RateLimiter (express-rate-limit; sliding window)                                     |
|  - IdempotencyMiddleware (SHA-256 payload deduplication with 24h TTL store)             |
|  - JWT Authentication (Sliding refresh rotation /api/auth/refresh)                      |
|  - CircuitBreaker (CLOSED -> OPEN -> HALF_OPEN state machine for external APIs)         |
|  - Health Probes (/api/health/live and /api/health/ready)                               |
|                                     |                                                   |
|                                     v                                                   |
|  [ Storage & Persistence ]                                                              |
|  - SQLite (sql.js) / Cloud Firestore                                                   |
+-----------------------------------------------------------------------------------------+
```

---

## 2. Architecture Decision Records (ADRs)

### ADR-001: Adoption of IndexedDB over LocalStorage for Offline Queuing
- **Status:** Accepted.
- **Context:** Field photo uploads for leaf disease diagnosis (5–12MB) quickly exceed LocalStorage's 5MB origin limit, causing fatal synchronous crashes.
- **Decision:** Standardize on IndexedDB (`idb`) with dedicated stores for `offline_actions`, `field_photos` (native Blobs), and `cached_telemetry`. Call `navigator.storage.persist()` to reduce eviction risk and handle `QuotaExceededError` gracefully by pruning transient telemetry caches.

### ADR-002: Client-Generated Idempotency Keys with Server Deduplication
- **Status:** Accepted.
- **Context:** Unstable 2G/EDGE cellular connections frequently drop TCP connections after the server receives an action, triggering automatic client retries and creating duplicate records.
- **Decision:** Client generates UUIDv4 `Idempotency-Key` headers on all mutating sync operations. Express server computes the SHA-256 hash of the payload and caches responses for 24 hours. Duplicate replayed keys return `X-Cache-Lookup: HIT` with identical original responses.

### ADR-003: Pure Domain Layer with Injected Dependencies & Branded Units
- **Status:** Accepted.
- **Context:** Mixing math calculations with React component state and async side-effects made agronomic logic untestable and prone to dimensional unit errors.
- **Decision:** Place all domain formulas in `src/domain/**` as pure functions accepting injected clocks `() => Date` and ID generators `() => string`. Use branded nominal types (`KilogramsPerHectare`, `Celsius`, `Latitude`) to prevent unit confusion at compile time.

### ADR-004: Strict Typing and Quality Gates in CI
- **Status:** Accepted.
- **Context:** Unchecked `any` usages and manual testing lead to regressions in critical agricultural calculators.
- **Decision:** Enforce TypeScript strict mode, `noUncheckedIndexedAccess`, zero untyped `any` tolerance, golden value benchmarks for FAO-56 evapotranspiration, and `fast-check` property tests on all pull requests via GitHub Actions.

---

## 3. Data Dictionary (Shared Contracts)

Derived from `src/shared/schemas/agriNetSchemas.ts`:

| Entity Schema | Field | Type | Validation Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| **CoordinatesSchema** | `latitude` | `number` | $[-90, 90]$ | GPS latitude coordinate. |
| | `longitude` | `number` | $[-180, 180]$ | GPS longitude coordinate. |
| **FieldObservationSchema** | `plotId` | `string` | $\le 64$ chars | Identifier of farm plot. |
| | `cropType` | `string` | $\le 100$ chars | Sown crop species. |
| | `growthStage` | `enum` | Vegetative, Flowering, GrainFilling, Maturity | Physiological growth stage. |
| | `observedSymptoms` | `string[]` | Max 20 items, each $\le 256$ chars | Phenotypic symptom tags. |
| | `affectedAreaPercentage` | `number` | $[0, 100]\%$ | Canopy damage ratio. |
| **PrescriptionActionSchema** | `prescriptionId` | `string` | $\le 64$ chars | Unique prescription ID. |
| | `recommendedTreatment` | `string` | $\le 500$ chars | Agro-chemical or bio-control. |
| | `dosageRateKgHa` | `number` | $[0, 10000]\text{ kg/ha}$ | Dosage rate in metric units. |
| | `status` | `enum` | PENDING, APPROVED, REJECTED, SUPERSEDED | Prescriptive workflow state. |
| **PlotTelemetrySchema** | `soilPH` | `number` | $[3.0, 11.0]$ | Soil pH reading. |
| | `nitrogenKgHa` | `number` | $[0, 1000]\text{ kg/ha}$ | Available nitrogen in soil. |
| | `soilMoistureIndexSMI` | `number` | $[0.00, 1.00]$ | Normalized root-zone moisture. |

---

## 4. Threat Model & Cryptographic Boundaries

1. **At-Rest Field Encryption:**
   - Sensitive farmer identifying details (phone, email) and precise field GPS coordinates stored in browser IndexedDB are encrypted using Web Crypto (`AES-GCM-256`) with a device-derived PBKDF2 key.
2. **Coordinate Fuzzing:**
   - Outbreak reports shared on public regional radars are truncated to 2 decimal places (~1.1km resolution) to prevent unauthorized commercial scouting of private smallholder plots.
3. **Formal Security Review Note:**
   - Cryptographic signing of agronomic prescriptions and differential privacy mechanisms for federated learning require formal independent audit by a certified security practitioner prior to high-consequence biosecurity deployments.

---

## 5. Disaster Recovery & Conflict Resolution Policies

- **Prescriptions & Escalated Tickets:**
  - Conflict policy: `MANUAL_REVIEW`. Concurrent server amendments are NEVER overwritten via Last-Write-Wins. Side-by-side diff review is presented to the extension officer.
- **In-Situ Telemetry:**
  - Conflict policy: `TIMESTAMP_MONOTONIC`. Older queued telemetry readings arriving after newer sensor values are safely discarded.
- **Rollback Strategy:**
  - If client-side IndexedDB errors or lock contention occur, the offline queue can be disabled by toggling `VITE_FEATURE_OFFLINE_QUEUE=false` without requiring application rebuilds.
