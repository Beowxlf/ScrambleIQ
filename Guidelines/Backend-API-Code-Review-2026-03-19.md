# Backend API Code Review (apps/api)

Date: 2026-03-19
Scope: `apps/api` only

## Strengths

- Clear modular separation across controllers, services, repositories, and database modules.
- Clean repository interfaces make storage backend swap (PostgreSQL vs in-memory) straightforward.
- Manual validation is comprehensive for most DTOs and rejects unknown fields.
- Baseline test suite covers health check, major endpoint flows, and dataset validation service behavior.
- Migration bootstrap ensures schema setup without requiring external migration tooling.

## Weaknesses and Risks (ranked)

### High

1. **Validation is duplicated across global pipe and services**
   - The same DTO payloads are validated in `GlobalValidationPipe` and again in services (`MatchesService`, `EventsService`, `PositionsService`, `VideosService`).
   - Risk: drift in behavior and extra maintenance cost.

2. **List endpoint has N+1 query pattern**
   - `MatchesService.findAll` loads all matches, then performs separate repository calls per match to compute summary counts and video existence.
   - Risk: poor scalability under PostgreSQL as match count grows.

3. **Update/delete flows perform pre-check + mutation with duplicate not-found branches**
   - Multiple services check existence with `findById`, then do `update`/`delete`, then check again for not-found.
   - Risk: extra queries and race windows between checks and mutations.

### Medium

4. **Controller route shape is only partially REST-consistent**
   - Some routes are nested under `/matches/:id/*` while updates/deletes for child resources are top-level (`/events/:id`, `/positions/:id`, `/video/:id`).
   - This is workable but increases cognitive load and API discoverability friction.

5. **PostgreSQL client relies on shelling out to `psql` and string SQL literals**
   - The custom `sqlLiteral` escaping approach and command-line invocation are simple, but less robust than parameterized driver usage.
   - Risk: correctness and operational fragility (binary availability, connection handling, SQL edge cases).

6. **Overlap protection for positions is service-level only**
   - Non-overlap is enforced in `PositionsService`, but not enforced by a database-level constraint.
   - Risk: concurrent writes could bypass intended invariant.

### Low

7. **Analytics calculation logic is duplicated**
   - Similar aggregation code appears in `MatchesService.getAnalytics` and `DatasetValidationService.buildAnalytics`.
   - Risk: future divergence.

8. **In-memory fallback persistence semantics are process-local and reset-on-restart**
   - Acceptable for scaffold phase, but behavior differs from PostgreSQL persistence characteristics.

## Validation Review

- **Unknown fields:** explicitly rejected across payload validators and list query validation.
- **Required fields:** consistently enforced for create DTOs.
- **Type and bounds checks:** generally strong for timestamps, enum-like values, and max lengths.
- **Notable inconsistency:** validation responsibility is split between global pipe and services (same rules applied in two places).

## Repository Abstraction Review

- Interfaces are clean and storage-agnostic.
- Module wiring swaps implementations using `DATABASE_CLIENT` presence.
- In-memory and PostgreSQL implementations mostly align in method contracts and sorting behavior.
- Main abstraction gap is performance expectations: `MatchRepository.findAll()` cannot return summary metadata, forcing service-level fan-out queries.

## Testing Gaps

1. No focused unit tests for core service classes (`MatchesService`, `EventsService`, `PositionsService`, `VideosService`).
2. No test coverage for migration service path-resolution/error branches.
3. No explicit parity tests comparing in-memory and PostgreSQL behavior for the same scenarios.
4. No performance-oriented tests around match listing summary fan-out.
5. Integration tests are present, but require dedicated environment and are not part of default `npm run test` workflow.

## Recommendations (prioritized)

1. **Single-source validation**: keep validation in one layer (prefer global pipe) and remove duplicate service-level DTO validation.
2. **Reduce list-query fan-out**: add repository method(s) for summary projection in a single data access call.
3. **Unify mutation error handling**: adopt single-step update/delete repository methods and one not-found branch.
4. **Add service unit tests**: especially for overlap checks, analytics, and not-found/error branches.
5. **Document route conventions**: codify whether child-resource updates remain top-level or nested and apply consistently.
6. **Harden data invariants**: add DB-level safeguards for overlap-sensitive rules when practical within current scope.
7. **Extract shared analytics builder**: avoid duplicated aggregation logic between match analytics and dataset validation.

## Assumptions Made

- Project is intentionally early-phase, so lightweight custom persistence and migration mechanisms are currently acceptable.
- Scope does not include dependency additions or full persistence redesign.
- Performance recommendations target maintainability and scalability without changing product behavior.
