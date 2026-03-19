# Shared Types and Contract Review (March 19, 2026)

## Scope reviewed

- `packages/shared` definitions and constants
- Backend DTO usage, validation, controller return contracts, and repository persistence mapping
- Frontend API client consumption and form-level validation alignment

## Current strengths

1. **Core domain contracts are centralized and widely reused.**
   - Shared match/event/position/video/dataset/analytics contracts are defined in one package and consumed by both `apps/api` and `apps/web`.
2. **Backend runtime validation reuses shared constants and enums.**
   - API validators enforce shared length limits and enum-like value sets from `@scrambleiq/shared`.
3. **Backend response typing is aligned with shared response models.**
   - Controllers return `Match`, `MatchListResponse`, `TimelineEvent`, `PositionState`, `MatchVideo`, `MatchAnalyticsSummary`, `MatchDatasetExport`, and `DatasetValidationReport` from shared contracts.
4. **Persistence mappings generally preserve shared model shape.**
   - Repositories map DB columns to shared property names consistently.

## Findings by severity

### High

1. **Frontend form validation drifts from backend runtime validation for match date.**
   - Frontend only checks that `date` is non-empty.
   - Backend requires strict calendar-valid `YYYY-MM-DD`.
   - Impact: users can submit dates that pass UI validation but fail API validation.

### Medium

2. **Frontend timeline validation drifts from backend `timestamp` upper bound.**
   - Frontend checks non-negative integer.
   - Backend also enforces `timestamp <= 86400` (one day).
   - Impact: avoidable server-side validation failures.

3. **Frontend and backend duplicate validation logic rather than sharing executable validation schemas.**
   - Both sides manually encode overlapping required-field and value rules.
   - Shared package currently shares types/constants but not validator functions/schemas.
   - Impact: ongoing drift risk (already visible in date/timestamp examples).

4. **`MatchDatasetVideo` duplicates `MatchVideo` structure instead of aliasing.**
   - `MatchDatasetEvent`/`MatchDatasetPosition` are aliases, but video is a separate interface with the same fields.
   - Impact: unnecessary maintenance surface and future drift risk.

### Low

5. **`CompetitorSide` is defined in shared but repeated as literal unions in several app-local DTO/form types.**
   - Multiple files restate `'A' | 'B'` instead of importing `CompetitorSide`.
   - Impact: readability/consistency issue; low functional risk.

6. **List query contract is app-local only (`ListMatchesQueryDto` / `ValidatedMatchListQuery`).**
   - Not currently shared with frontend client query type.
   - Impact: small drift risk on filter/pagination parameter naming and semantics.

## Duplicated or misplaced types

### Duplicated outside `packages/shared`

- Repeated competitor unions (`'A' | 'B'`) in backend DTOs and frontend form conversion helpers.
- Independent frontend API query input shape for `listMatches(...)` and backend query DTO/normalized type.

### Potentially misplaced in `packages/shared`

- Candidate to **move in** (or add) to shared:
  - A single `ListMatchesQuery` contract (request shape + normalized response semantics).
  - Optional shared helper for strict ISO date string validation if UI and API should stay behaviorally aligned.

### Potentially over-shared / should remain local

- NestJS DTO classes themselves should remain API-local (framework concerns).
- UI-only form state types (`timestamp` as string, local error maps) should remain web-local.

## Recommendations

1. **Prioritize a small contract-alignment pass (no architecture rewrite):**
   - Add strict `YYYY-MM-DD` validation to `apps/web/src/match.ts` to match API behavior.
   - Add `<= 86400` constraint to timeline timestamp frontend validation.
2. **Reduce duplication in shared types:**
   - Convert `MatchDatasetVideo` to `type MatchDatasetVideo = MatchVideo` unless divergence is intentionally planned.
   - Replace repeated `'A' | 'B'` with `CompetitorSide` where practical.
3. **Introduce a shared query contract for list endpoint parameters:**
   - Define a shared `ListMatchesQuery` type (raw/optional fields) used by frontend client and backend DTO validation entrypoint.
4. **Optional next hardening step (still incremental):**
   - Introduce shared runtime schema utilities (or lightweight shared validators) for date/timestamp rules to prevent future drift.

## Assumptions made

1. This review targets current Phase 1 scaffold scope and avoids broad architecture changes.
2. API runtime behavior is treated as source-of-truth for contract enforcement where UI and API differ.
3. Query contract sharing is considered beneficial only for cross-app request/response boundaries, not framework-specific DTO classes.
