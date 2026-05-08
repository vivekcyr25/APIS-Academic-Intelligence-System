# APIS AI — Architectural Manifest (v1.2.0)

## 🏗️ Platform Philosophy
APIS AI is designed as a **Calm, Offline-First Academic Operating System**. It prioritizes user confidence, data integrity, and ambient intelligence over feature density.

## 📡 Data Architecture
### Firestore Schema
- `users/{uid}`: Root user container.
  - `profile/academic`: Singleton doc for onboarding and preferences.
  - `semesters/{id}`: Collection of academic terms.
  - `subjects/{id}`: Collection of courses, linked to semesters via `semesterId`.
  - `timeline/{id}`: Longitudinal events (assignments, exams).
  - `analytics/cgpa`: Aggregated performance metrics.

### Synchronization Model
- **Offline Persistence**: Multi-tab IndexedDB (via Firestore `persistentMultipleTabManager`).
- **Conflict Resolution**: Last-write-wins (Firestore default) with client-side optimistic UI.
- **Latency Compensation**: Real-time listeners (`onSnapshot`) ensure UI is always reactive.

## 🧠 Intelligence Infrastructure
- **Rule-Based Engine**: Local computation of SGPA/CGPA and attendance risks.
- **LLM Synthesis**: Gemini 1.5 Flash (via `aiService.ts`) for emotionally intelligent reflections.
- **Vision Pipeline**: Hybrid Tesseract OCR + Gemini Cognitive structuring for automated data entry.

## 🌐 PWA & Release Lifecycle
- **Cache Strategy**: 
  - Assets: `NetworkFirst` with `4MB` limit.
  - Academic Data: Firestore local cache.
- **Update Flow**: `autoUpdate` enabled. New versions are detected by `registerSW` and applied on the next session.
- **Versioning**: Semantic versioning (SemVer) tracked in `package.json` and displayed in `TopNav`.

## 🛡️ Security Model
- **Isolation**: Rules-enforced `request.auth.uid == userId`.
- **Privacy**: No PII sent to LLM; only anonymized academic vectors used for synthesis.
- **Logout Hygiene**: Force terminate Firestore and clear IndexedDB on sign-out.

## 🛠️ Maintenance & Monitoring
- **Telemetry**: Custom `Telemetry` service wrapping Firebase Analytics.
- **Crash Reporting**: `ErrorBoundary` trapping with automatic telemetry logging.
- **Scalability**: Components memoized for 100+ subjects.

---
*Last Updated: 2026-05-08 | APIS Core Team*
