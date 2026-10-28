# Contributing to BRICS AgriNet

Welcome to the BRICS AgriNet development community. We build open, resilient, cross-border agricultural intelligence infrastructure for smallholder farmers and extension teams across BRICS nations.

---

## 1. Development Prerequisites

- **Node.js**: Pin to version specified in `.nvmrc` (v20.18.0 or higher active LTS).
  ```bash
  nvm use
  ```
- **Package Manager**: npm v10+.
- **Environment Variables**: Copy `.env.example` to `.env` and configure local API keys.

---

## 2. Local Setup & Commands

```bash
# Install dependencies
npm install

# Start full-stack development server (Express backend + Vite HMR on port 3000)
npm run dev

# Run TypeScript strict typecheck
npm run typecheck

# Run test suite
npm run test

# Run all quality validation gates locally before committing
npm run validate

# Production build
npm run build
```

---

## 3. Core Architectural Constitution

### A. Pure Domain Layer Purity (`src/domain/**`)
- All mathematical, agronomic, and queue-ordering logic MUST reside in `src/domain/**`.
- **Absolute Isolation:** Domain modules must NEVER import from `react`, `react-dom`, `@google/genai`, or browser networking APIs (`fetch`, `XMLHttpRequest`).
- **Injected Clocks & IDs:** Never call `Date.now()`, `new Date()`, `Math.random()`, or `crypto.randomUUID()` directly inside domain functions. Always accept injected functions:
  ```ts
  now: () => Date
  generateId: () => string
  ```
- **Branded Types:** Always use nominal unit types from `src/domain/types/units.ts` (e.g., `KilogramsPerHectare`, `Celsius`, `Latitude`) to prevent catastrophic unit mismatch errors.

### B. Defensive Offline Engineering (`src/infrastructure/storage/**`)
- Do NOT use LocalStorage for heavy application records or images. Use `IndexedDbStorage` (`idb`).
- Field crop diagnostic photos must be saved natively as binary `Blob` objects.
- Multi-tab synchronization must acquire the Web Locks API (`executeWithExclusiveSyncLock`) before executing replay.
- Always include an `Idempotency-Key` UUID header on mutating actions.

### C. Testing Standard
- **Agronomic Formulas:** Require golden-value comparison tests against peer-reviewed benchmark datasets (e.g., FAO-56 Irrigation and Drainage Paper 56).
- **Mathematical Invariants:** Must be verified with `fast-check` property-based tests (asserting monotonicity, symmetry, and boundary limits).
- **Zero Broken Replays:** Offline queue synchronization tests must prove zero lost actions across simulated network dropouts.

---

## 4. Pull Request Checklist

Before submitting a Pull Request, ensure that:
1. `npm run validate` passes locally with 0 errors and 0 warnings.
2. No `any` type annotations are introduced.
3. Accessible attributes (`role="status"`, `aria-live="polite"`, semantic labels) are preserved.
4. Any new Zod contract in `src/shared/schemas/` is mirrored in `ARCHITECTURE.md`.
