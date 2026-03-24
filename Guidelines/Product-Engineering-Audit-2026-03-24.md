# ScrambleIQ Full Product + Engineering Audit (2026-03-24)

This document records a code-and-docs-grounded audit of the implemented repository state as of 2026-03-24.

## Scope audited

- Frontend app (`apps/web`)
- Backend API (`apps/api`)
- Shared contracts (`packages/shared`)
- Tests (`apps/web/tests`, `apps/api/test`)
- Repository docs (`README.md`, `Guidelines/*`)

## Bottom-line assessment

ScrambleIQ is currently a **manual-first grappling match annotation workspace** with deterministic API-backed reporting and exports. It is **not** an automated AI video analysis platform today.

## Implemented capability baseline

- Match CRUD with filtering and pagination
- Manual timeline event tagging
- Manual position segment tagging with overlap protections
- Video metadata attachment and in-page playback seeking
- Derived single-match analytics
- Dataset validation + deterministic JSON export
- Review templates (CRUD + apply-in-session checklist)
- Saved review presets (CRUD + apply filter settings)
- Taxonomy guardrails for event-type normalization
- Collection-level reporting (summary, trends, validation, export)

## Critical findings

1. Product scope is coherent around manual workflows, but docs are mixed between current and legacy ML visions.
2. Reporting outputs are deterministic and threshold-driven, but many insights are descriptive with limited prescribed next action.
3. UX requires substantial manual data entry and strong domain discipline; this can limit coach adoption.
4. Architecture is maintainable for phase-one/phase-three scale, but in-memory fallback and full-table filtering patterns are not long-term scaling strategies.
5. Test suite is broad and meaningful for current scope, though weighted toward happy-path and mocked UI tests.

## Recommended immediate direction

- Keep the manual-first core.
- Narrow next roadmap to reducing annotation burden and improving coach decision support.
- Defer advanced automation until data quality, taxonomy discipline, and workflow adoption are proven.
