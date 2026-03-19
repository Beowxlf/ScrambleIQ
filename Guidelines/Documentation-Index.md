# ScrambleIQ
## Documentation Index and Status Matrix

This index defines documentation status labels used across `Guidelines/` and prevents scope drift.

Status labels:

- **Current source of truth**: reflects implemented behavior for the current manual-first baseline.
- **Future-state planning**: intentional forward-looking planning; not implemented now.
- **Historical / legacy**: kept for context only; does not describe implemented V1 behavior.
- **Needs rewrite**: known mismatch requiring update before being used for implementation.

Terminology standard:

- Use **video metadata attachment** for current implemented V1 behavior.
- Use **video upload pipeline** only when describing explicit future-state plans.

| Document | Status | Notes |
|---|---|---|
| `README.md` | Current source of truth | Setup, runtime modes, and implemented feature behavior. |
| `Guidelines/Version-1-Scope.md` | Current source of truth | Implemented V1 boundaries and explicit out-of-scope list. |
| `Guidelines/Roadmap.md` | Current source of truth | Phased future direction anchored on manual-first V1 baseline. |
| `Guidelines/Phase-2-Kickoff.md` | Current source of truth | Phase 2 acceptance contract and exclusions. |
| `Guidelines/Tech-Stack.md` | Current source of truth | Architecture/stack decisions with future ML clearly scoped as future. |
| `Guidelines/System-Architecture.md` | Current source of truth | Rewritten to implemented manual-first architecture. |
| `Guidelines/User-Flow-Doc.md` | Current source of truth | Rewritten to implemented manual-first user journey. |
| `Guidelines/Functional-Requirements-Specs.md` | Current source of truth | Rewritten to implemented manual-first FRS and constraints. |
| `Guidelines/Statement-of-Purpose.md` | Current source of truth | Rewritten to manual-first product purpose and scope boundaries. |
| `Guidelines/Frontend-Architecture-Refactor-Plan.md` | Current source of truth | Internal architecture plan aligned to current app behavior. |
| `Guidelines/Phase-1-Closeout-Checklist.md` | Current source of truth | Validation checklist for implemented baseline. |
| `Guidelines/Test-Suite-Review-2026-03-19.md` | Current source of truth | Point-in-time technical review for test suite. |
| `Guidelines/Backend-API-Code-Review-2026-03-19.md` | Current source of truth | Point-in-time backend review document. |
| `Guidelines/Frontend-Code-Review-2026-03-19.md` | Current source of truth | Point-in-time frontend review document. |
| `Guidelines/Security-Review-2026-03-19.md` | Current source of truth | Point-in-time security assessment. |
| `Guidelines/Security-Baseline-Audit.md` | Current source of truth | Security baseline gaps and recommendations. |
| `Guidelines/Security-Remediation-Plan.md` | Current source of truth | Security remediation plan and sequencing. |
| `Guidelines/Shared-Types-Contract-Review.md` | Current source of truth | Shared-types contract review of implemented behavior. |
| `Guidelines/AI-ML-Requirments.md` | Historical / legacy | Legacy planned AI/ML requirements; not implemented in V1. |
| `Guidelines/Event-Detection-Taxonomy.md` | Historical / legacy | Legacy event-detection taxonomy for future exploration. |
| `Guidelines/Known-Limitations.md` | Historical / legacy | Describes limits of non-implemented AI/ML pipeline. |
| `Guidelines/Problem-Statement.md` | Historical / legacy | Earlier framing tied to upload + AI/ML + 3D assumptions. |
| `Guidelines/Target-User-Profile.md` | Historical / legacy | Mixed with non-implemented pipeline assumptions. |
| `Guidelines/Testing-Validation-Plan.md` | Needs rewrite | Broadly references non-implemented upload/AI/ML/3D testing scope. |
| `Guidelines/Leverage.md` | Historical / legacy | Legacy strategy narrative anchored on non-implemented AI/ML assumptions. |

## Governance Rules

1. If a document conflicts with a **Current source of truth** document, the current-source document wins.
2. Historical/legacy docs must retain a banner stating they are non-implemented for V1.
3. Future-state docs must explicitly label non-implemented capabilities as future.
4. New docs must include status classification in this index when added.
