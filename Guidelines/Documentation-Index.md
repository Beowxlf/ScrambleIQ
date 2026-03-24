# ScrambleIQ Documentation Index

This index identifies which documents reflect the current implemented product state at end of **Prototype 1**.

Status labels:

- **Current source of truth**: reflects implemented behavior or active prototype governance.
- **Transitional**: retained for continuity but not authoritative for current scope.
- **Future-state planning**: intentionally forward-looking; not implemented now.
- **Historical / legacy**: context only; not implementation authority.
- **Needs rewrite**: known mismatch and should not drive implementation.

| Document | Status | Notes |
|---|---|---|
| `README.md` | Current source of truth | Prototype 1 overview, setup, workflow, limits, and path to 1.0. |
| `Guidelines/System-Architecture.md` | Current source of truth | Implemented monorepo/layer architecture and reporting flow. |
| `Guidelines/Product-Scope-Prototype-1.md` | Current source of truth | Prototype product scope boundary and validation questions. |
| `Guidelines/Reporting-Prototype-1.md` | Current source of truth | Implemented reporting behavior and interpretation guidance. |
| `Guidelines/Prototype-1-Status.md` | Current source of truth | Completion status and pre-1.0 next steps. |
| `Guidelines/Tech-Stack.md` | Current source of truth | Implemented stack and deferred capabilities. |
| `Guidelines/Version-1-Scope.md` | Transitional | Retained placeholder; 1.0 scope intentionally not finalized. |
| `Guidelines/Roadmap.md` | Future-state planning | Directional planning, not guaranteed implementation. |
| `Guidelines/Phase-1-Closeout-Checklist.md` | Historical / legacy | Phase checkpoint evidence. |
| `Guidelines/Phase-2-Kickoff.md` | Historical / legacy | Phase planning checkpoint. |
| `Guidelines/Phase-2-Acceptance-Evidence.md` | Historical / legacy | Evidence snapshot. |
| `Guidelines/Phase-2-Closeout-Checklist.md` | Historical / legacy | Evidence snapshot. |
| `Guidelines/Phase-2-DB-Evidence.md` | Historical / legacy | Evidence snapshot. |
| `Guidelines/Phase-2-Discovery-Sorting-Decision.md` | Historical / legacy | Historical planning decision. |
| `Guidelines/Phase-3-Kickoff.md` | Historical / legacy | Phase planning checkpoint. |
| `Guidelines/Phase-3-Acceptance-Evidence.md` | Historical / legacy | Evidence snapshot. |
| `Guidelines/Phase-3-Closeout-Checklist.md` | Historical / legacy | Evidence snapshot. |
| `Guidelines/Phase-3-DB-Evidence.md` | Historical / legacy | Evidence snapshot. |
| `Guidelines/Phase-4-Kickoff.md` | Historical / legacy | Phase planning checkpoint. |
| `Guidelines/Functional-Requirements-Specs.md` | Needs rewrite | May include superseded framing; do not use as sole authority. |
| `Guidelines/User-Flow-Doc.md` | Needs rewrite | May include superseded framing; reconcile before reuse. |
| `Guidelines/Statement-of-Purpose.md` | Needs rewrite | Requires explicit Prototype 1 positioning review. |
| `Guidelines/Known-Limitations.md` | Historical / legacy | Older limitation framing; README + prototype docs are current. |
| `Guidelines/AI-ML-Requirments.md` | Historical / legacy | Not implemented in current prototype. |
| `Guidelines/Event-Detection-Taxonomy.md` | Historical / legacy | Not implementation authority for current runtime. |
| `Guidelines/Problem-Statement.md` | Historical / legacy | Earlier framing; not current scope authority. |
| `Guidelines/Target-User-Profile.md` | Needs rewrite | Reconcile with validated prototype target user assumptions. |
| `Guidelines/Testing-Validation-Plan.md` | Needs rewrite | Ensure alignment with current test commands and scope. |
| `Guidelines/Leverage.md` | Historical / legacy | Legacy strategy narrative. |

## Governance rules

1. If two docs conflict, the newest **Current source of truth** doc wins.
2. Prototype docs must separate implemented behavior from deferred ideas.
3. Do not treat roadmap or historical phase docs as proof of current functionality.
