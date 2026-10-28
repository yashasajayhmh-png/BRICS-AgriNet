# Comprehensive Engineering Implementation Plan: BRICS AgriNet Enterprise Modernization

**Target Application:** BRICS AgriNet (Cross-Border Agricultural Intelligence & Agro-Ecological Network)  
**Revision:** v2.0 (Senior Engineering Architecture & Production Hardening Review)  
**Status:** Under User Review (Planning Mode Phase 2)

---

## Codebase Audit Matrix: "Exists, Harden" vs "New"

To ground this plan in reality, the existing repository was audited prior to architecture drafting:

| Component / Subsystem | Current State in Codebase | Audit Classification | Modernization Scope |
| :--- | :--- | :--- | :--- |
| **Authentication & RBAC** | `server/auth.ts` provides JWT signing, `requireAuth`, `requireRole`, and `optionalAuth` middleware. | **Exists, Harden** | Add sliding-window JWT refresh token flow, session revocation, token-expiry handling during replay of queued offline mutations. |
| **Rate Limiting** | `server/rateLimit.ts` uses `express-rate-limit` with in-memory store. | **Exists, Harden** | Document single-instance memory store limitation; design adapter interface supporting Redis/Valkey for horizontal scaling; add client retry-after header parsing. |
| **Circuit Breakers & Fallbacks** | `server/fallbacks.ts` implements static retry loops and heuristic mock fallbacks for Gemini APIs. | **Exists, Harden** | Implement formal 3-state machine (Closed, Open, Half-Open) with configurable error thresholds, reset timeouts, telemetry emission, and fake-timer test harness. |
| **Health Monitoring** | Single `GET /api/health` in `server.ts` returning database status and API key flags. | **Exists, Harden** | Split into `/api/health/live` (shallow ping) and `/api/health/ready` (deep dependency probe) without leaking software versions, environment keys, or internal topology. |
| **Image Security Validation** | `server/imageSecurity.ts` validates Magic bytes, MIME types, and file dimension headers. | **Exists, Harden** | Keep existing buffer inspection; integrate Zod schema boundary validation for base64/multipart uploads. |
| **Observability & Metrics** | `server/observability.ts` captures Gemini latency and token counters in-memory. | **Exists, Harden** | Add global `unhandledrejection` / `uncaughtException` listeners, structured error logging, and client-side replay error dispatch. |
| **Localization & i18n** | `src/context/I18nContext.tsx` with English, Hindi, Portuguese, Arabic, Russian, Chinese, and Spanish. | **Exists, Harden** | Add ICU message formatting / pluralization support for dynamic quantities (e.g., sync queue pending count). |
| **Offline Storage & Queue** | No persistent queue; state held strictly in React memory or ephemeral API requests. | **NEW** | Build IndexedDB queue (`idb`), Blob storage for crop photos, Web Locks leader election, and Web Crypto at-rest field encryption. |
| **Service Worker & PWA** | No service worker configured; relies on standard browser caching. | **NEW** | Integrate `vite-plugin-pwa` with Workbox for app shell precaching, lazy-route chunk caching, and background sync. |
| **Server Idempotency** | Requests processed directly without deduplication headers or idempotency caches. | **NEW** | Add `Idempotency-Key` middleware with TTL memory/cache store to guarantee zero duplicate writes on network replay. |
| **Domain Layer Separation** | Agronomy calculations (yield, NPK, evapotranspiration) embedded in UI components and services. | **NEW** | Extract pure domain modules into `src/domain/` with injected clocks/IDs, branded units, and strict ESLint import boundaries. |
| **Shared Contracts (Zod)** | Ad-hoc TypeScript interfaces without runtime validation between client and server. | **NEW** | Shared contract library in `src/shared/schemas/` with bidirectional validation and automated schema documentation. |
| **Golden & Property Testing** | Ad-hoc unit tests exist for some server utilities; no domain invariant or golden agronomy suites. | **NEW** | FAO-56 evapotranspiration golden tests, `fast-check` property tests, and MSW integration journey tests. |
| **E2E Smoke Suite** | No browser automated testing. | **NEW** | Playwright headless smoke suite simulating network throttling, offline disconnects, and sync recovery. |
| **CI Quality Pipeline** | No `.github/workflows/ci.yml`. | **NEW** | Parallel quality pipeline: typecheck (`strict`), lint (`@typescript-eslint/no-explicit-any`), Vitest with coverage, `size-limit`, and Lighthouse CI. |

---

## 1. Overview & Core Concept

BRICS AgriNet serves agricultural scientists, farm extension officers, and smallholder farmers operating across diverse, low-connectivity geographies (Brazil, Russia, India, China, South Africa, and partner nations). In field conditions, network availability is intermittent, device resources are constrained, and agronomic decisions carry severe economic and food-security consequences.

This engineering plan outlines an enterprise-grade refactoring that transforms BRICS AgriNet into a resilient, offline-first, mathematically verified, and production-hardened platform. The refactoring adheres to strict software craftsmanship:
1. **Mathematical Purity:** Agronomy models separated from presentation frameworks, verified with published peer-reviewed reference datasets (FAO-56) and property-based invariance testing.
2. **Defensive Offline Engineering:** Native IndexedDB persistence with quota negotiation, multi-tab leader synchronization via Web Locks, per-entity queue isolation, and server-side idempotency deduplication.
3. **Zero-Trust Security & Boundary Safety:** Cryptographic at-rest encryption for sensitive field data, sliding-window JWT refreshment, sanitized API boundaries, and strict non-leaking health observability.
4. **Strict Quality Gates:** Automated CI pipelines blocking regressions with strict type-safety, zero untyped `any` allowances, and bundle size enforcement.

---

## 2. UX & Field Polish

Field conditions require high-contrast, low-cognitive-load interfaces that communicate system state without ambiguity:

- **Plural-Aware Network & Sync Status Banner:**
  - Placed at the top viewport boundary with semantic accessibility markup: `role="status"` and `aria-live="polite"`.
  - Driven by the enhanced `useNetworkStatus` hook with hysteresis (requires 3 consecutive ping failures before transitioning to "Offline", and 1 success to transition to "Online" to eliminate flakiness on 2G/EDGE towers).
  - Uses ICU pluralization across all 7 supported languages. Examples:
    - *English:* "Offline Mode: 1 action queued for synchronization" vs "Offline Mode: 4 actions queued for synchronization".
    - *Arabic:* Full dual and plural grammatical inflection (Zero, One, Two, Few, Many, Other).
    - *Russian:* Grammatical cases for 1, 2-4, 5+ queued records.
- **Dead-Letter Queue (DLQ) Recovery UI:**
  - When a queued action exceeds maximum retry limits (e.g., 5 attempts) or encounters unrecoverable server validation rejection (422), it transitions to a visible "Needs Review" state rather than dropping silently.
  - Farmers or extension officers can inspect the queued submission, review the validation failure message, edit invalid values, and trigger a manual resubmission or safely discard it.
- **Graceful Chunk-Load Error Boundaries:**
  - All lazily loaded tabs (Satellite Telemetry, Outbreak Radar, Crop Economics, Soil Testing) are wrapped in specialized React Error Boundaries equipped with auto-retry chunk loaders and user-facing "Retry Connection" buttons.
  - The PWA Service Worker precaches primary chunks to prevent 404s when navigating tabs offline.
- **Tactile Conflict Resolution Modals:**
  - When non-mergeable entity conflicts occur (e.g., Agronomic Prescriptions or Field Ticket status modified concurrently on the server), the UI displays a side-by-side diff modal allowing the user to preserve field notes or accept the central advisory update without data loss.

---

## 3. Key Decisions & Trade-Offs

### Decision 1: Pure Domain Layer with Injected Dependencies & Branded Units
- **Context:** Agronomic formulas (FAO-56 Penman-Monteith reference evapotranspiration, NPK deficit balance, yield risk adjustments) were previously scattered within UI components and async service files.
- **Choice:** Establish pure domain modules in `src/domain/` strictly isolated from React, DOM, and networking APIs. Domain functions receive pure inputs, injected clocks (`() => Date`), and injected ID generators (`() => string`). Introduce branded TypeScript types (e.g., `KilogramsPerHectare`, `PoundsPerAcre`, `MillimetersWater`) to eliminate unit-confusion errors at compile time.
- **Enforcement:** Enforce architectural isolation using ESLint (`no-restricted-imports`) forbidding imports of `react`, `react-dom`, `@google/genai`, or `fetch` inside `src/domain/**`.
- **Trade-Off:** Requires explicit parameter passing and mapping layers at UI/infrastructure boundaries, but unlocks 100% deterministic testability and enables code sharing across Node.js and web workers.

### Decision 2: IndexedDB Storage with Quota Management & Multi-Tab Web Locks
- **Context:** Field photo uploads for disease diagnosis (5–12MB each) quickly exceed LocalStorage's 5MB origin limit, causing synchronous crashes. Multiple open browser tabs replaying queues concurrently create race conditions.
- **Choice:** Use `idb` (lightweight IndexedDB wrapper) with dedicated stores for `offline_actions`, `cached_advisories`, and `field_photos`. Store diagnostic images natively as binary `Blob` objects. Request persistent storage via `navigator.storage.persist()` and gracefully handle `QuotaExceededError` with automated cleanup of non-critical tile caches. Use the browser `navigator.locks` (Web Locks API) to ensure exactly one leader tab executes queue replay upon network restoration.
- **Trade-Off:** IndexedDB APIs are asynchronous and more complex than LocalStorage; mitigated through clean repository interfaces in `src/infrastructure/storage/`.

### Decision 3: Server-Side Idempotency & Per-Entity Queue Ordering
- **Context:** Strict global FIFO queueing blocks all synchronization if a single heavy media upload fails. Retrying timed-out requests can duplicate prescriptions or field incident reports on the server.
- **Choice:** Implement per-entity queue isolation: queue items targeting different field IDs or crop cycles process independently. Client generates a deterministic UUID `Idempotency-Key` sent in request headers. Express server verifies the key against an in-memory/cache store with a 24-hour TTL; identical replayed keys return the original cached response with `X-Cache-Lookup: HIT`.
- **Trade-Off:** Requires maintaining an idempotency cache on the server, but completely guarantees zero duplicate records during flaky mobile handovers.

### Decision 4: Tiered Testing Strategy: FAO-56 Golden Values, Property Invariants, and Playwright Smokes
- **Context:** High code coverage percentage does not prove agricultural mathematical correctness or resilient offline recovery.
- **Choice:**
  1. *Golden Tests:* Benchmark calculations against published FAO-56 Annex tables (FAO Irrigation and Drainage Paper No. 56) for solar radiation, vapor pressure, and reference evapotranspiration ($ET_0$).
  2. *Property-Based Tests (`fast-check`):* Verify mathematical invariants across thousands of randomized inputs (e.g., yield loss $\in [0, 100]\%$; distance function is symmetric; fertilizer deficit is monotonic with respect to application rate).
  3. *Integration Journeys (Vitest + MSW):* Exercise full workflows (crop planning, offline advisory queuing, network reconnection) with mocked HTTP layer and fake system timers.
  4. *Targeted Playwright Smokes:* 4 core journeys run on a single browser instance with network emulation (offline, slow 3G) and service worker precache verification.

---

## 4. System Architecture & ASCII Diagram

```
+-------------------------------------------------------------------------------------------------------+
|                                        CLIENT BROWSER (PWA)                                           |
|                                                                                                       |
|  +-------------------------------------------------------------------------------------------------+  |
|  |                                  PRESENTATION LAYER (React 19)                                  |  |
|  |  +---------------------------+  +--------------------------+  +------------------------------+  |  |
|  |  | Plural-Aware Sync Banner  |  | Lazy Tab Boundaries      |  | Dead-Letter Queue Review UI  |  |  |
|  |  | [role="status"]           |  | (Retry + Chunk Precache) |  | (Manual Resync / Edit)       |  |  |
|  |  +---------------------------+  +--------------------------+  +------------------------------+  |  |
|  +-------------------------------------------------|-----------------------------------------------+  |
|                                                    v                                                  |
|  +-------------------------------------------------------------------------------------------------+  |
|  |                                    HOOKS & STATE ORCHESTRATION                                  |  |
|  |  - useNetworkStatus (Hysteresis, exponential ping backoff + jitter)                             |  |
|  |  - useOfflineQueue (Web Locks leader election, per-entity concurrency)                          |  |
|  +-------------------------------------------------|-----------------------------------------------+  |
|                                                    v                                                  |
|  +-------------------------------------------------------------------------------------------------+  |
|  |                       DOMAIN LAYER (src/domain/** - Pure, Invariant-Tested)                     |  |
|  |  +------------------------+  +------------------------+  +-----------------------------------+  |  |
|  |  | domain/agronomy        |  | domain/telemetry       |  | domain/offline                    |  |  |
|  |  | - FAO-56 ETo engine    |  | - Soil moisture sensor |  | - Queue ordering & retry policy   |  |  |
|  |  | - NPK deficit balance  |  | - Weather anomalies    |  | - Conflict resolution strategies  |  |  |
|  |  | - Branded metric units |  | - Outbreak clustering  |  | - Zero external side-effects      |  |  |
|  |  +------------------------+  +------------------------+  +-----------------------------------+  |  |
|  |  +-------------------------------------------------------------------------------------------+  |  |
|  |  | domain/security (PII sanitization, field-level encryption, token expiry check)            |  |  |
|  |  +-------------------------------------------------------------------------------------------+  |  |
|  +-------------------------------------------------|-----------------------------------------------+  |
|                                                    v                                                  |
|  +-------------------------------------------------------------------------------------------------+  |
|  |                         INFRASTRUCTURE LAYER (src/infrastructure/**)                            |  |
|  |  +-----------------------------------------+   +---------------------------------------------+  |  |
|  |  | Storage Adapters                        |   | Network & Sync Engine                       |  |  |
|  |  | - IndexedDB Storage (idb)               |   | - Web Locks API (Leader Tab Election)       |  |  |
|  |  | - Web Crypto Encrypted Store            |   | - Service Worker precache / Workbox         |  |  |
|  |  | - Native Blob Store (Crop photos)       |   | - Replay Dispatcher with Idempotency-Key    |  |  |
|  |  | - InMemoryAdapter (Vitest harness)       |   | - Auth Token Refresh Interceptor            |  |  |
|  |  +-----------------------------------------+   +---------------------------------------------+  |  |
|  +-------------------------------------------------|-----------------------------------------------+  |
+----------------------------------------------------|--------------------------------------------------+
                                                     | HTTPS (Headers: Authorization, Idempotency-Key)
                                                     v
+-------------------------------------------------------------------------------------------------------+
|                                    BACKEND SERVICE (Express in Node.js)                               |
|                                                                                                       |
|  +-------------------------------------------------------------------------------------------------+  |
|  |                                  SECURITY & GATEWAY MIDDLEWARE                                  |  |
|  |  - Rate Limiter (express-rate-limit; sliding window; Redis-ready adapter)                       |  |
|  |  - JWT Authentication Middleware (Sliding refresh rotation, role authorization)                 |  |
|  |  - Server-Side Idempotency Middleware (Deduplication store with TTL cache)                      |  |
|  |  - Input Validation & Sanitization (Shared Zod Contracts)                                       |  |
|  +-------------------------------------------------|-----------------------------------------------+  |
|                                                    v                                                  |
|  +-------------------------------------------------------------------------------------------------+  |
|  |                                   CONTROLLERS & RESILIENCE LAYER                                |  |
|  |  +-------------------------+  +-------------------------+  +---------------------------------+  |  |
|  |  | Outbreak & Agro Routes  |  | Circuit Breakers        |  | Health Check Endpoints          |  |  |
|  |  | - Field Sync Dispatch   |  | (Closed/Open/Half-Open) |  | - /api/health/live (Shallow)    |  |  |
|  |  | - Prescription Issuance |  | - Gemini API Protection |  | - /api/health/ready (Deep probe)|  |  |
|  |  +-------------------------+  +-------------------------+  +---------------------------------+  |  |
|  +-------------------------------------------------|-----------------------------------------------+  |
|                                                    v                                                  |
|  +-------------------------------------------------------------------------------------------------+  |
|  |                                    PERSISTENCE & DATA SERVICES                                  |  |
|  |  - SQLite (sql.js) / Firestore Integration                                                      |  |
|  |  - Observability & Metrics Logging (No credentials, structured telemetry)                       |  |
|  +-------------------------------------------------------------------------------------------------+  |
+-------------------------------------------------------------------------------------------------------+
```

---

## 5. Implementation Roadmap (Strict Sequence)

### Step 1: Domain Architecture & Pure Logic Extraction
- **Scope:**
  - Create `src/domain/agronomy/`, `src/domain/telemetry/`, `src/domain/offline/`, and `src/domain/security/`.
  - Introduce branded types (`src/domain/types/units.ts`) for units of measurement:
    - `KilogramsPerHectare`, `PoundsPerAcre`, `MillimetersWater`, `Celsius`, `Latitude`, `Longitude`.
    - Boundary validators asserting non-negative fertilizer rates, valid latitude range $[-90, 90]$, and longitude $[-180, 180]$.
  - Characterization Tests: Prior to refactoring, write characterization test suites capturing the exact output of existing calculations in components. Refactor formulas into pure functions, inject clock `() => Date` and ID generator `() => string`, and assert zero behavioral drift.
  - Formulate `src/domain/offline/`: pure queue transition functions (`enqueueAction`, `dequeueAction`, `markFailed`, `resolveConflict`), max retry rules, and priority ordering.
  - Define `src/domain/security/`: payload PII redaction rules, token expiry evaluators, and payload hash verification.
  - Establish Shared Zod Schemas in `src/shared/schemas/` covering:
    - `FieldObservationSchema`, `PrescriptionActionSchema`, `SyncActionSchema`, `IdempotencyPayloadSchema`.
  - Add ESLint rule enforcing isolation: forbid `src/domain/**` from importing React, DOM, or networking modules.
  - Update `ARCHITECTURE.md` with an auto-generated data dictionary from Zod schemas.

### Step 2: Server Hardening & Security
- **Scope:**
  - *Auth Hardening:* Extend `server/auth.ts` to support sliding-window JWT refresh token issuance (`POST /api/auth/refresh`), token revocation lists, and offline re-auth verification.
  - *Server-Side Idempotency Middleware:* Create `server/idempotency.ts`. Store incoming `Idempotency-Key` headers alongside payload SHA-256 hashes in a dedicated deduplication store with 24-hour TTL. Return replayed responses identically with `X-Cache-Lookup: HIT`.
  - *Rate Limiter Refactoring:* Formalize `server/rateLimit.ts` interface with comments documenting in-memory vs Redis cluster migration paths for multi-instance deployments.
  - *Circuit Breaker State Machine:* Upgrade `server/fallbacks.ts` into a rigorous 3-state machine (`CLOSED`, `OPEN`, `HALF_OPEN`) tracking rolling failure windows, consecutive recovery successes, and fallback triggers for Gemini API calls.
  - *Health Monitoring Split:*
    - `GET /api/health/live`: Fast Kubernetes/load-balancer liveness probe returning `{ status: "ok" }`.
    - `GET /api/health/ready`: Deep readiness probe checking database connectivity, auth keystore readiness, and storage writeability. Never output software version strings, environment keys, or internal IPs.
  - *Threat Model Documentation:* Document cryptographic boundaries in `ARCHITECTURE.md` (e.g., prescription digital signatures, differential privacy guarantees on outbreak telemetry) with explicit notes requiring security audit prior to high-stakes agronomic deployment.

### Step 3: Automated Testing & Verification Suite
- **Scope:**
  - *Vitest & Harness Configuration:* Configure Vitest with jsdom environment, fake timers, and deterministic seeded RNG.
  - *FAO-56 Golden Value Tests:* Create test suite in `tests/domain/fao56.test.ts` matching published benchmark tables for saturation vapor pressure ($e_s$), actual vapor pressure ($e_a$), slope of vapor pressure curve ($\Delta$), and psychrometric constant ($\gamma$). Flag suite for agronomic domain scientist review.
  - *Property-Based Invariant Tests (`fast-check`):*
    - Yield adjustment is bounded $\in [0, 100]\%$.
    - NPK deficit is strictly monotonic with respect to applied nutrients.
    - Haversine distance calculation is strictly symmetric ($dist(A, B) \equiv dist(B, A)$) and obeys triangle inequality.
    - Outbreak incident clustering is independent of input array insertion order.
  - *API Integration Tests:* Use `supertest`. Export Express `app` instance from `server.ts` independently from `.listen()`. Test auth flows, rate-limit thresholds, and circuit-breaker state transitions using fake timers.
  - *Deterministic Queue Replay Test:* Prove zero lost actions across: offline enqueue $\to$ simulated process restart $\to$ network reconnect $\to$ server failure mid-replay $\to$ re-auth $\to$ complete successful replay.

### Step 4: Resilient Offline Layer & PWA
- **Scope:**
  - *PWA Service Worker:* Install and configure `vite-plugin-pwa` with Workbox. Precache app shell, stylesheet assets, and lazy-route code chunks. Configure service worker update prompts.
  - *Storage Infrastructure (`src/infrastructure/storage/`):*
    - Implement `IndexedDbStorageAdapter` using `idb` with schema migrations (`v1` to `v2`).
    - Dedicated Blob store for field crop photos with `QuotaExceededError` handling and eviction prevention (`navigator.storage.persist()`).
    - Encrypt sensitive location coordinates and farmer PII at rest in IndexedDB using browser Web Crypto (`AES-GCM-256`).
    - Wipe offline queue stores immediately upon explicit user logout.
  - *Multi-Tab Safety:* Implement Web Locks API (`navigator.locks.request('agrinet_sync_lock', ...)`) with fallback to leader-election broadcast channel, guaranteeing a single tab executes queue processing.
  - *Enhanced Network Detection (`useNetworkStatus`):*
    - Dual check: `navigator.onLine` combined with active lightweight ping `/api/health/live`.
    - Hysteresis filter: 3 consecutive failed pings required to enter offline state; 1 successful ping returns to online state.
    - Exponential backoff with random jitter between pings to prevent battery drain and server thundering herds.
  - *Feature Flag:* Guard offline engine behind `VITE_FEATURE_OFFLINE_QUEUE=true` with seamless fallback to direct HTTP requests.
  - *Localized Sync Banner:* Integrate ICU plural strings into `I18nContext` for all 7 languages. Add accessibility attributes (`role="status"`, `aria-live="polite"`).
  - *Dead-Letter UI:* Add drawer/modal for inspecting, modifying, and retrying failed actions.

### Step 5: Performance, Lazy Loading & Observability
- **Scope:**
  - *Bundle Baseline & Budgets:* Integrate `rollup-plugin-visualizer` into `vite.config.ts`. Set hard production budget limits with `size-limit` (e.g., initial JS vendor chunk $< 180\text{ kB}$ gzip).
  - *Dependency Lazy-Loading:* Lazy-load heavy visualization libraries (Leaflet maps, Chart.js graphs) using dynamic imports (`import()`) rather than bundling into main bundle.
  - *Resilient Chunk Error Boundaries:* Wrap dynamic imports with an Error Boundary providing retry action when network disconnects interrupt chunk downloads.
  - *Observability & Unhandled Rejection:*
    - Configure global `window.addEventListener('unhandledrejection', ...)` and `window.addEventListener('error', ...)`.
    - Forward sanitized client diagnostic traces to `/api/telemetry/errors`.
    - Ensure offline replay exceptions log structured telemetry with error codes without halting execution of independent entity queues.

### Step 6: CI/CD Pipeline & Quality Gates
- **Scope:**
  - Add `.nvmrc` pinning active Node.js LTS (e.g., `20.18.0`).
  - Configure `.github/workflows/ci.yml` running parallelized jobs on pull requests:
    1. **Typecheck:** `tsc --noEmit` with `strict: true` and `noUncheckedIndexedAccess: true`.
    2. **Lint & Clean Code:** ESLint with `@typescript-eslint/no-explicit-any: "error"` and domain import restriction rules.
    3. **Automated Testing:** Vitest running unit, golden, and property suites with enforced code coverage threshold.
    4. **Bundle Gate:** `npm run build` followed by `size-limit` verification.
    5. **Security Scan:** `npm audit --audit-level=high` and static secret scanning.
  - Add scheduled nightly job for Playwright smoke tests across simulated network profiles (Offline, 3G, Packet Loss).
  - Update `package.json` scripts: `"typecheck": "tsc --noEmit"`, `"test:coverage": "vitest run --coverage"`, `"validate": "npm run typecheck && npm run lint && npm run test"`.
  - Add Husky and `lint-staged` pre-commit configurations for local git hooks.

### Step 7: Documentation & Operational Readiness
- **Scope:**
  - Create `CONTRIBUTING.md`: local setup instructions, Node version enforcement, commit conventions, testing expectations, and domain purity guidelines.
  - Update `README.md`: architectural summary, quick start, offline-first development mode, and environment variable glossary (`.env.example`).
  - Update `ARCHITECTURE.md`:
    - Record Architecture Decision Records (ADRs) for IndexedDB, Web Locks, Branded Types, and Server Idempotency.
    - Publish generated schema data dictionary.
    - Disaster recovery, offline sync conflict policies, and deployment rollback strategy.

---

## 6. Definition of Done (Per Step)

- **Step 1 (Domain Architecture):**
  - All agronomic and queue transition functions located in `src/domain/**` with zero imports from `react`, `react-dom`, or networking packages.
  - Characterization tests pass verifying zero behavioral regression.
  - Branded types and Zod schemas compile with zero errors under `noUncheckedIndexedAccess`.
- **Step 2 (Server & Security):**
  - Supertest tests pass demonstrating JWT refresh rotation and 401 expiration handling.
  - Server idempotency middleware drops duplicates with `X-Cache-Lookup: HIT`.
  - Circuit breaker trips to `OPEN` on consecutive failures and resets to `HALF_OPEN` after timeout.
  - Health checks split into `/live` and `/ready` with no credential or topology leakage.
- **Step 3 (Automated Testing):**
  - FAO-56 test suite passes against published reference data.
  - Property-based tests run minimum 100 iterations without invariant violation.
  - Deterministic queue replay test demonstrates zero lost records under simulated disconnection.
- **Step 4 (Resilient Offline & PWA):**
  - App shell and lazy chunks precached by Service Worker; loads in offline Chrome devtools.
  - Crop disease photos stored natively as Blobs in IndexedDB; `QuotaExceededError` handled cleanly.
  - Single leader tab handles synchronization when multiple tabs are open simultaneously.
  - Pluralized sync banner correctly displays in all 7 languages using ICU rules with accessibility roles.
- **Step 5 (Performance & Observability):**
  - Visualizer report generated; initial JS bundle satisfies budget.
  - Heavy chart and map modules load asynchronously.
  - Chunk loading failures recover via Retry UI.
  - Global unhandled rejections captured and logged cleanly.
- **Step 6 (CI/CD Quality Gates):**
  - GitHub Actions CI workflow runs all jobs in parallel and succeeds.
  - `npm run typecheck` and `npm run validate` execute locally with exit code 0.
  - Zero `any` types detected by `@typescript-eslint/no-explicit-any`.
- **Step 7 (Documentation):**
  - `CONTRIBUTING.md`, `README.md`, and `ARCHITECTURE.md` updated and validated for technical accuracy.

---

## 7. Acceptance Criteria & Quantifiable Success Metrics

1. **Test Coverage & Precision:**
   - $\ge 80\%$ line and branch coverage across `src/domain/**` and `server/**`.
   - $100\%$ pass rate on FAO-56 golden evapotranspiration benchmarks with error margin $< 0.001\text{ mm/day}$.
2. **Offline Data Preservation:**
   - $0\%$ data loss across $50$ sequential simulated field actions queued while offline, replayed upon reconnection.
   - $0$ duplicate entries generated on the server when replaying identical payloads.
3. **Performance & Bundle Limits:**
   - Core app initial download payload $\le 190\text{ kB}$ (gzipped).
   - Lighthouse Performance Score $\ge 90$ on Mobile Slow 4G profile.
   - Time to Interactive (TTI) $\le 2.5\text{ seconds}$ on 4x CPU slowdown simulation.
4. **Resilience & Fault Tolerance:**
   - Circuit breaker trips within 5 failed external Gemini API requests, shedding load in $< 2\text{ ms}$ with fallback responses.
   - Zero synchronous UI crashes when IndexedDB storage quota is exhausted.

---

## 8. Risks & Mitigations

| Risk | Impact | Probability | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **IndexedDB Quota Exceeded during high-res photo uploads** | High | Medium | Check `navigator.storage.estimate()` prior to saving Blobs. Implement automatic downscaling of images $> 2048\text{px}$ in a Web Worker, and provide clean UI warning before quota limit. |
| **Race conditions during multi-tab queue replay** | High | Medium | Use Web Locks API (`navigator.locks.request`). Provide fallback leader-election via `BroadcastChannel` for older browsers. |
| **JWT expiration during extended multi-day offline field trips** | Medium | High | Implement persistent offline refresh token store; trigger silent refresh interceptor before initiating queue replay. Prompt offline user for biometric/PIN re-auth if refresh token is expired. |
| **Agronomic calculation drift during formula refactoring** | High | Low | Create characterization tests capturing current component behavior prior to touching formula code; verify with FAO-56 golden datasets. |
| **Flaky network false positives causing battery drain** | Low | Medium | Add hysteresis (3 failures required for offline, 1 success for online) and exponential backoff with jitter on pings. |

---

## 9. Rollout Plan & Deployment Strategy

- **Phase 1: Canary Feature Flagging**
  - The offline queue engine is deployed behind feature flag `VITE_FEATURE_OFFLINE_QUEUE=false` by default.
  - Enable in staging environment for field trial users in select agricultural zones.
- **Phase 2: Gradual Staged Rollout**
  - Deploy server hardening (idempotency headers, circuit breakers, split health probes) first. Server remains 100% backwards-compatible with legacy un-queued requests.
  - Enable PWA precaching and Service Worker for 25% $\to$ 50% $\to$ 100% of web clients.
- **Phase 3: Rollback Plan**
  - If unexpected IndexedDB corruption or lock starvation occurs, toggle `VITE_FEATURE_OFFLINE_QUEUE=false` remotely or via deployment config.
  - The client instantly falls back to direct synchronous HTTP requests with standard toast notifications.

---

## 10. Effort Estimates & Suggested Ownership

| Workstream | Key Deliverables | Estimated Effort | Suggested Skillset / Ownership |
| :--- | :--- | :--- | :--- |
| **Domain & Math Purity** | `src/domain/`, FAO-56 tests, `fast-check` properties, Branded types | 3 Engineering Days | Senior Agronomy / Core Logic Engineer |
| **Offline Engine & PWA** | IndexedDB, Web Locks, Workbox precaching, Blob management | 4 Engineering Days | Senior Frontend / PWA Systems Engineer |
| **Server & Security** | Idempotency middleware, Circuit breakers, JWT refresh, Health split | 3 Engineering Days | Senior Backend / Infrastructure Engineer |
| **Quality Gates & CI/CD** | GitHub Actions, `.nvmrc`, `size-limit`, Lighthouse CI, Playwright | 2 Engineering Days | DevOps / Tooling Engineer |
| **Documentation & UX** | ICU i18n banner, Dead-letter UI, `CONTRIBUTING.md`, ADR records | 2 Engineering Days | Full-Stack UI / Tech Lead |

---

## 11. Architecture Decision Records (ADRs) Summary

- **ADR-001: Adoption of IndexedDB over LocalStorage for Field Queuing**
  - *Decision:* Standardize on `idb` for structured action queuing and native binary Blob handling.
  - *Status:* Approved.
- **ADR-002: Client-Generated Idempotency Keys with Server Deduplication**
  - *Decision:* Enforce UUIDv4 `Idempotency-Key` headers on all mutating sync operations with 24h server TTL.
  - *Status:* Approved.
- **ADR-003: Pure Agronomic Engine with Injected Dependencies**
  - *Decision:* Zero UI or platform framework dependencies inside `src/domain/**`. Clocks and ID generators must be injected.
  - *Status:* Approved.
- **ADR-004: Strict Typing and Zero Untyped Any Policy**
  - *Decision:* Enable `noUncheckedIndexedAccess` and enforce `@typescript-eslint/no-explicit-any` as a blocking error in CI.
  - *Status:* Approved.

---

## 12. Assumptions & Open Questions

### Technical Assumptions:
1. Modern target mobile browsers (Chrome 90+, Safari 15.4+, Firefox Mobile 95+) support IndexedDB and the Web Locks API or BroadcastChannel.
2. The server application runs in a containerized environment (Node.js 20 LTS) where `/api/health/live` and `/api/health/ready` can be queried by orchestrators (Docker/Kubernetes).
3. The existing SQLite database (`sql.js`) and Firebase integration remain the primary persistence engines for backend records.

### Open Questions for Agricultural & Field Stakeholders:
1. *Prescription Conflict Strategy:* If a central agronomy center issues a new chemical/fertilizer prescription while a field officer enters an emergency manual spray treatment offline, should the manual spray override, queue as a concurrent amendment, or require manager sign-off? (Current plan: flags as conflict for manual side-by-side review).
2. *Image Downscaling Policy:* What is the minimum acceptable resolution for crop leaf disease diagnosis? (Current assumption: downscale to maximum 2048px on longest edge to preserve stomatal and fungal spore features while conserving storage).
3. *Redis Deployment for Distributed Rates:* Should the server rate-limiting and idempotency cache default to an in-memory TTL store for single-container setups, or should a Redis/Valkey connection URL be parameterized in `.env.example` immediately? (Current plan: default to memory store with clean Redis-ready adapter pattern).
