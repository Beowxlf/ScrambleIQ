# Frontend Code Review (apps/web) — 2026-03-19

## Scope

- Reviewed `apps/web` only, including app shell, pages, feature modules (`events`, `positions`, `video`, `analytics`, `dataset`), hooks, API boundary, and frontend tests.
- Evaluated boundaries, state flow, hook responsibilities, cross-feature coordination, test structure, maintainability, and visual consistency risks.
- No architecture redesign or dependency additions proposed.

## High-level strengths

1. **Feature modularization is materially in place and aligns with the Phase-1 extraction plan.**
   - `App.tsx` is now a thin composition root and delegates to `AppShell`.
   - `MatchDetailPage` orchestrates feature panels while each feature owns its local hook/form/list.
2. **Feature module shape is largely consistent across domains.**
   - `*Panel` + `*Form`/`*List` + `useMatch*` pattern appears across events, positions, video, analytics, dataset tools.
3. **Cross-feature synchronization has explicit handoff points.**
   - Event/position mutations trigger workspace refresh used by analytics and dataset tools.
   - Timeline/position selection feeds video seek requests.
4. **Test suite breadth is strong for phase-one behavior.**
   - Tests exist for page workflows and each major feature panel, including CRUD paths, validation states, and API error rendering.

## Key weaknesses and risks (ranked)

### Critical

None identified.

### High

1. **`MatchDetailPage` is overgrown and mixes page orchestration with complex match-edit/delete UI details.**
   - File length and state surface area are high, increasing regression risk and making future feature additions expensive.
   - Symptoms include many independent local states and large inline edit/delete markup in one component.

2. **Potential stale-response race in `useMatches` during rapid filter/pagination changes.**
   - `loadMatches` can be triggered repeatedly by filter state updates; there is no request sequencing, abort handling, or "latest request wins" guard.
   - A slower prior request can overwrite results from a newer request.

### Medium

3. **Repeated async/error/reset boilerplate across feature hooks.**
   - `useMatchEvents`, `useMatchPositions`, and `useMatchVideo` repeat very similar load/reset/mutate/error patterns.
   - This duplicates maintenance effort and causes subtle divergence (e.g., error detail fidelity differs by feature).

4. **Error handling consistency differs across features.**
   - Events/positions pass backend validation details through `HttpRequestError.message`; video save/delete currently falls back to generic messages in catch-all blocks.
   - UX consistency and debugging quality vary by feature.

5. **Weak separation still exists between page-level orchestration and match metadata feature concerns.**
   - Match edit/delete logic is still embedded in `MatchDetailPage` instead of a dedicated match-detail feature module/hook.

### Low

6. **Visual consistency drift risk from mixed styling approaches.**
   - Most UI uses shared class-based styles, but `MatchDetailPage` still includes inline style usage.

7. **Naming/structure inconsistency around API module pathing.**
   - Both `src/matches-api.ts` and `src/api/matchesApi.ts` exist (the latter re-exports from the former), which can cause import pattern drift.

## Component architecture review

- **App shell/routing:** clean and minimal; custom route parser and navigation remain intentionally lightweight for phase one.
- **Page boundaries:**
  - `MatchListPage` is generally clean: create + list coordination, with listing behavior delegated to `useMatches` and presentational components.
  - `MatchDetailPage` is still the most complex part and currently acts as both orchestration layer and metadata feature implementation.
- **Feature boundaries:**
  - Events/positions/video/analytics/dataset panels are reasonably bounded and mostly presentational with hook delegation.
  - Event and position modules are especially consistent in shape and behavior.

## Hook/state review

- **Good:**
  - Hooks encapsulate most feature-local CRUD state.
  - Cross-feature state synchronization is explicit via callbacks and refresh trigger integer.
- **Risks:**
  - `useMatches` can race on rapid query changes.
  - `workspaceRefreshTrigger` coarse invalidation is simple but can become noisy as more features attach to it.
  - `seekRequest` uses `Date.now()` request IDs; workable now but not deterministic in tests without stubbing and can collide in theory.

## Cross-feature coordination review

- **Current approach works for phase one:**
  - Events/positions call mutation callbacks, which refresh analytics and reset dataset tool state.
  - Seek integration between timeline items and video playback is straightforward.
- **Scalability concern:**
  - Coordination currently relies on page-level callback plumbing and shared trigger counters, which may become difficult to reason about as more modules are added.

## Test structure and gaps

### Strengths

- Substantial behavior coverage exists across app-level and feature-level tests.
- Test names indicate attention to CRUD flows, validation, and error states.

### Gaps

1. **Missing targeted tests for race/stale state in match list filtering.**
   - No explicit assertions for out-of-order async responses in `useMatches`.
2. **No isolated tests for routing primitives (`parseRoute`, navigation/popstate interaction).**
   - Behavior is indirectly covered via app tests but lacks focused unit checks.
3. **Limited tests for cross-feature edge orderings.**
   - For example: fast consecutive event+position mutations and refresh deduplication semantics.
4. **No explicit test enforcing consistent backend error detail surfacing across feature modules (video vs events/positions).**

## Duplicated logic identified

1. `getRequestErrorMessage` exists in multiple hooks with near-identical behavior.
2. Load/reset lifecycle and `isMounted` guard pattern repeated across feature hooks.
3. Sorted list update logic repeated for events and positions after create/edit.

## Recommended improvements (prioritized, no scope expansion)

1. **(High) Extract match metadata editing/deletion into a small `features/match-detail` module** (panel + hook) while keeping current behavior.
2. **(High) Make `useMatches` request-safe** using an incrementing request token or `AbortController` so stale responses cannot overwrite newer filter results.
3. **(Medium) Introduce tiny shared async helper(s)** for common loading/error/reset flow (as already suggested in the architecture plan).
4. **(Medium) Standardize API error message handling across features, especially video mutations.**
5. **(Low) Remove remaining inline styles and use shared classes for presentation consistency.**
6. **(Low) Choose one canonical API import path and deprecate the alternate alias module to reduce drift.**
7. **(Medium) Add focused tests** for routing unit behavior and list-filter stale-response handling.

## Alignment with documented Phase 1 / Phase 2 direction

- The current frontend generally **matches documented Phase-1 modularization direction** and keeps manual-first behavior intact.
- The main remaining architecture debt is concentrated in match detail page internals and repeated hook infrastructure, both consistent with previously documented "hardening" follow-up work rather than a redesign.

## Assumptions made

1. This review treats current architecture documents as source of truth and assumes no hidden Phase-2 requirements beyond documented direction.
2. Recommendations intentionally avoid introducing global state libraries or router replacements.
3. This review assumes maintainability and regression risk reduction are primary goals over feature expansion.
