# Test Suite Review (2026-03-19)

## Scope reviewed

- `apps/web/tests/*`
- `apps/api/test/*`
- `apps/api/test/integration/*`

## Summary of strengths

1. **Strong API critical-path route coverage in e2e tests.**
   - `matches.e2e.test.ts` covers CRUD + validation + error contracts for matches, events, positions, videos, analytics, export, and validation endpoints.
2. **Frontend review workflow coverage is broad.**
   - App/page/panel tests cover list-to-detail navigation, annotation CRUD flows, seek interactions, analytics refresh triggers, and dataset tools interactions.
3. **PostgreSQL persistence is directly validated.**
   - Integration tests validate migrations, FK constraints, repository CRUD behavior, and persistence across app restarts.
4. **Validation-focused tests exist at multiple levels.**
   - DTO validation is tested through API e2e tests, and basic form/domain validation exists in web unit tests.

## Critical gaps

1. **PostgreSQL integration tests are excluded from the default `npm run test` path.**
   - `apps/api/vitest.config.ts` excludes `test/integration/**/*.test.ts`, and root `test` runs workspace defaults.
   - This creates risk that PRs can pass default tests while silently breaking PostgreSQL behavior.
2. **Current integration test runner requires Docker (`apps/api/scripts/run-integration-tests.sh`).**
   - In environments without Docker, integration coverage does not execute.
3. **`DatasetValidationService` branch coverage is incomplete in unit tests.**
   - Current tests do not explicitly verify sorting issues, event-out-of-range issues, or analytics mismatch detection branches.

## Medium-priority gaps

1. **No explicit e2e coverage for match list query edge cases beyond a subset of validation checks.**
   - Examples not covered: negative offset, very large offset, combined invalid date ranges (`dateFrom > dateTo`) behavior.
2. **Limited failure-path coverage for repository integration tests.**
   - Integration tests mostly verify happy-path CRUD and cascade behavior; low-level SQL/constraint violation cases are minimally exercised.

## Flaky or fragile test risks

1. **High copy-coupling in UI assertions.**
   - Many tests assert exact prose strings and button labels; small UX copy changes can cause broad test churn.
2. **Heavy App-level interaction tests can become timing-sensitive.**
   - Long, multi-step tests with repeated asynchronous updates are generally stable now, but carry maintenance/flakiness risk over time.
3. **Environment-dependent integration execution.**
   - Integration tests fail fast when Docker is unavailable, reducing reliability of full-suite execution in constrained CI/dev environments.

## Redundant / low-value overlap candidates

1. **Event flow is tested at multiple layers with similar assertions.**
   - `event-panel.test.tsx` and `timeline-events.ui.test.tsx` both cover create/edit/delete + validation pathways.
2. **Position flow similarly overlaps.**
   - `position-panel.test.tsx` and `position-states.ui.test.tsx` both verify sorted display and CRUD flows.
3. **Video metadata flow has overlap between panel and app-level tests.**
   - `video-panel.test.tsx` and `video-review.ui.test.tsx` both cover attach/edit/delete and seek behavior.

> Recommendation: keep layered coverage, but reduce duplicate assertions by making panel tests behavior-focused and app-level tests orchestration-focused.

## Prioritized recommendations

### P0 (highest value)

1. **Gate PostgreSQL integration tests in CI and local pre-merge docs.**
   - Ensure `npm run test:integration` runs in CI for backend-impacting changes.
   - Add clear CI signal when integration tests are skipped.
2. **Add targeted `DatasetValidationService` tests for currently unverified branches.**
   - Sorting issue generation.
   - Event-out-of-range warning generation.
   - Analytics mismatch detection.

### P1

1. **Add small API e2e tests for query boundary behavior.**
   - Offset validation, date-range consistency rules, and expected response semantics.
2. **Add one failure-focused repository integration test per repository.**
   - Example: invalid FK insertion behavior or constraint violation handling.

### P2

1. **Reduce brittle copy assertions in UI tests where practical.**
   - Prefer semantic role/state assertions for core behavior; keep exact copy assertions for intentionally stable user-facing messaging.
2. **Consolidate duplicated flow assertions.**
   - Keep one detailed CRUD flow per layer and trim repeated checks in sibling suites.

## Assumptions made

1. The expected critical path includes: event flow, position flow, video metadata flow, analytics refresh, dataset export/validation, and PostgreSQL persistence.
2. This review emphasizes test quality/coverage analysis over implementation changes.
3. PostgreSQL integration tests are treated as required quality gates for persistence correctness.
4. No test weakening/removal is proposed in this review document.
