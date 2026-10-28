# 🌱 BRICS AgriNet

> **Sovereign Multi-Agent Agronomic Advisory & Biosecurity Network for Smallholder Farmers across BRICS and the Global South**

BRICS AgriNet is a multi-agent agricultural intelligence and transboundary biosecurity platform engineered specifically for smallholder farming communities across BRICS member nations (**Brazil, Russia, India, China, South Africa, Egypt, Ethiopia, Iran, and the UAE**).

The platform bridges real-time remote sensing, multimodal Gemini vision diagnosis, multi-agent agronomic deliberation, sovereign federated learning commons, and human-in-the-loop extension workflows to democratize precision agronomy without compromising national data sovereignty or farmer privacy.

---

## 🌟 Key Highlights & Architectural Pillars

- **🤖 Multi-Agent Deliberative Advisory**: Synthesizes localized agronomic prescriptions by evaluating competitive candidate recommendations against biophysical crop simulations, soil chemistry, and weather constraints before delivering safe, executable guidance.
- **🔬 Multimodal Computer Vision Diagnosis**: Visual leaf and pest triage utilizing Gemini 2.5 Flash Vision to identify pathogens, quantify confidence metrics, provide organic vs. chemical remediation, and auto-escalate uncertain cases to district agronomists.
- **🛰️ Satellite Remote Sensing & Biophysical Modeling**: High-resolution Sentinel-2 NDVI vegetative index tracking, real-time soil moisture and N-P-K profiling, and interactive *What-If* simulation engines for yield forecasting.
- **🛡️ Sovereign Federated Learning Commons**: Decentralized model refinement across national research institutes (ICAR, Embrapa, ARC, CAAS) using differential privacy ($\epsilon = 1.2, \delta = 10^{-5}$) and FedAvg weight aggregation, ensuring raw agricultural data never crosses sovereign borders.
- **⚠️ Transboundary Pest & Pathogen Early Warning**: Spatial sentinel clustering across geopolitical boundaries (e.g., Desert Locust, Fall Armyworm, Wheat Blast, Banana TR4) providing automated alert radiuses and proactive containment buffers.
- **👨‍🌾 Human-in-the-Loop Extension Copilot**: Triage queues for escalated low-confidence cases, automated alternative credit score assessments for unbanked smallholders, and cryptographically verified digital prescriptions.
- **📦 FPO & Cooperative Marketplace**: Collective bargaining pools for bulk input procurement, parametric crop micro-insurance, guaranteed buyer buyback arrangements, and transparent community review boards.
- **🌍 Inclusive Global South Accessibility**: Comprehensive internationalization across 11 languages with full bi-directional text layout (LTR & RTL for Arabic), high-contrast accessibility compliance, keyboard navigation, and Web Speech API audio advisories.

---

## 🏛️ System Architecture

```text
                               ┌───────────────────────────────────────────────┐
                               │           BRICS AgriNet Client (PWA)          │
                               │  React 19 • Tailwind CSS 4 • Motion • i18n   │
                               └───────┬───────────────────────────────┬───────┘
                                       │                               │
                                       ▼                               ▼
                      ┌─────────────────────────────────┐   ┌───────────────────────┐
                      │    Express & Vite Middleware    │   │  Firebase Firestore   │
                      │   - JWT Auth & Rate Limiters    │   │  - Realtime Plots     │
                      │   - OpenAPI 3.1 & Model Monitor │   │  - Escalated Tickets  │
                      │   - Fallback Circuit Breakers   │   │  - User Auth & Rules  │
                      └────────────────┬────────────────┘   └───────────────────────┘
                                       │
     ┌─────────────────────────────────┼─────────────────────────────────┐
     │                                 │                                 │
     ▼                                 ▼                                 ▼
┌────────────────────────┐  ┌────────────────────────┐  ┌────────────────────────┐
│   Google Gemini API    │  │   SQLite Database      │  │ Federated Learning     │
│  - Gemini 2.5 Flash    │  │  - SQL.js / In-Memory  │  │  - Local Silo Training │
│  - Vision Diagnosis    │  │  - Farmer Registry     │  │  - Differential Priv.  │
│  - Multi-Agent Delib.  │  │  - Diagnosis Logs      │  │  - Sovereign Ledger    │
│  - TTS / Speech Synth  │  │  - Outbreak Sentinels  │  │  - FedAvg Aggregator   │
└────────────────────────┘  └────────────────────────┘  └────────────────────────┘
```

---

## 🗺️ Module Breakdown

| Module | Route / Tab | Description |
| :--- | :--- | :--- |
| **Field Advisory** | `advisory` | Multi-agent agronomic council evaluating soil parameters, weather risks, and localized farming practices. |
| **Crop Diagnosis** | `diagnosis` | Drag-and-drop crop photo analysis detecting blight, rust, pests, and nutrient deficiencies with confidence grading. |
| **Satellite & Soil** | `satellite_soil` | Sentinel-2 NDVI time-series, soil moisture depth charts, and biophysical fertilizer simulation sliders. |
| **Farm Profile** | `farm_profile` | Farm parcel boundaries, crop histories, consent settings (research opt-in/opt-out), and push notifications. |
| **Extension Copilot**| `copilot` | Dedicated dashboard for agronomists to audit escalated cases, write signed prescriptions, and assess creditworthiness. |
| **Federated Commons** | `federated` | Simulated federated learning rounds with differential privacy clipping and global model weight convergence. |
| **Outbreak Sentinel**| `outbreak` | Interactive geospatial alert map for transboundary vector propagation and early quarantine notifications. |
| **FPO Marketplace** | `fpo_marketplace` | Cooperative bulk buying pools, certified seed/fertilizer suppliers, and parametric weather insurance policies. |
| **Governance & APIs**| `governance_api` | OpenAPI 3.1 specs, AgGateway ADAPT schema alignments, model observability counters, and audit logs. |
| **Agronomy Knowledge**| `knowledge` | Step-by-step practical agronomy guides covering IPM, composting, drip irrigation, and harvest storage. |
| **Architecture** | `architecture` | Deep-dive documentation on system pillars, benchmarks against legacy systems, and sovereign roadmap. |

---

## 🌐 Supported Languages & Regional Scripts

BRICS AgriNet features native script localization and bidirectional typography:

| Language | Code | Script / Direction | Primary Regions |
| :--- | :---: | :---: | :--- |
| **English** | `en` | Latin (LTR) | Global South / International |
| **Hindi (हिन्दी)** | `hi` | Devanagari (LTR) | India (Northern & Central) |
| **Marathi (मराठी)** | `mr` | Devanagari (LTR) | India (Maharashtra) |
| **Telugu (తెలుగు)** | `te` | Telugu (LTR) | India (Andhra Pradesh, Telangana) |
| **Portuguese (Português)** | `pt` | Latin (LTR) | Brazil |
| **Spanish (Español)** | `es` | Latin (LTR) | Latin America & Caribbean |
| **Swahili (Kiswahili)** | `sw` | Latin (LTR) | East Africa (Kenya, Tanzania, Uganda) |
| **Mandarin Chinese (中文)** | `zh` | Simplified Han (LTR) | China |
| **Arabic (العربية)** | `ar` | Arabic (RTL) | Egypt, UAE, North Africa & Middle East |
| **Amharic (አማርኛ)** | `am` | Ge'ez (LTR) | Ethiopia |
| **Russian (Русский)** | `ru` | Cyrillic (LTR) | Russia & Central Asia |

---

## 🛠️ Tech Stack & Dependencies

- **Frontend**: React 19, TypeScript, Tailwind CSS 4, Motion (`motion/react`), Lucide React icons.
- **Backend & Server**: Node.js, Express, `sql.js` (SQLite engine), `cookie-parser`, `express-rate-limit`, `jsonwebtoken`.
- **AI & Computer Vision**: `@google/genai` TypeScript SDK (Gemini 2.5 Flash with fallback circuit breakers).
- **Cloud & Realtime Storage**: Firebase Firestore, Firebase Authentication with role-based security rules.
- **Build & Dev**: Vite 6, TSX, esbuild, Vitest.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm** or **bun**
- (Optional) **Google Gemini API Key** (set via environment variable for live multimodal inference; fallback models handle offline/mock mode automatically)

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-username/brics-agrinet.git
cd brics-agrinet
npm install
```

### 2. Environment Setup

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Configure your variables:

```ini
# Gemini API Key for vision and advisory inference
GEMINI_API_KEY="your-gemini-api-key-here"

# App URL (defaults to localhost for development)
APP_URL="http://localhost:3000"

# JWT Secret for farmer and extension officer authentication
JWT_SECRET="your-secure-jwt-secret-key"
```

### 3. Development Server

Start the full-stack development server (Express backend + Vite HMR on port 3000):

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Running Tests & Linting

Validate code integrity and database fallback invariants:

```bash
# Type check and linting
npm run lint

# Run unit tests with Vitest
npm run test
```

### 5. Production Build

Build the static client bundle and bundle the server executable:

```bash
npm run build
npm start
```

---

## 🔒 Security & Data Sovereignty Specification

The platform enforces strict security controls and privacy safeguards documented in `security_spec.md`:

1. **User Identity Invariant**: Profile records are strictly partitioned under `/users/{userId}` and only editable by verified owners or authorized extension administrators.
2. **Diagnosis Attribution**: Diagnostic records in `/diagnoses/{diagnosisId}` enforce immutable ownership and client timestamp verification.
3. **Differential Privacy Guarantee**: Federated updates inject calibrated Gaussian noise with privacy loss budget $\epsilon \leq 1.2$, preventing training data extraction.
4. **Rate Limiting & DoS Protection**: Separate token bucket and sliding window rate limits on `/api/auth`, `/api/gemini/diagnosis`, and `/api/federated/round`.
5. **No Blind Updates**: All database mutations validate explicit schemas and reject phantom fields.

---

## 📄 License

Licensed under the [Apache License, Version 2.0](LICENSE).  
Copyright (c) 2026 BRICS AgriNet Contributors.
