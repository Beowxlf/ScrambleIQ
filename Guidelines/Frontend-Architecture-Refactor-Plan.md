# Frontend Architecture Refactor Plan (Phase 1)

## Scope and intent

This document defines an incremental refactor plan for `apps/web` to reduce coupling in `App.tsx` while preserving all current Phase-1 behavior and backend API compatibility.

The plan is explicitly manual-first and does not introduce ML analysis, automated tagging, authentication, or backend contract changes.

## Current frontend audit

`apps/web/src/App.tsx` currently combines app-shell concerns, page-level orchestration, feature state management, API orchestration, and presentation markup in one file. The file currently includes:

- Lightweight route parsing and navigation (`/` and `/matches/:id`) with `history.pushState` and `popstate` listeners.
- Match list page behavior:
  - create form state, validation, submission, and success/error messaging
  - match listing and loading/error states
  - competitor and has-video filtering
- Match detail page behavior:
  - match fetch/edit/delete
  - timeline event CRUD + validation + edit-mode handling
  - position state CRUD + validation + edit-mode handling
  - video metadata attach/edit/remove + validation
  - video player binding + timeline/position seek synchronization
  - analytics loading/refresh after annotation mutations
  - dataset export JSON download flow
  - dataset validation execution and grouped issue rendering

### Mixed responsibilities currently present in `App.tsx`

1. **Routing and page composition**: custom route parsing and top-level view switching.
2. **Feature orchestration**: data fetch/load/reset lifecycle for each domain area.
3. **Form state and validation wiring**: per-feature form values/errors/submit handlers.
4. **Domain CRUD side effects**: API calls, optimistic/non-optimistic updates, sorting.
5. **Cross-feature synchronization**: event/position mutations trigger analytics refresh.
6. **Video synchronization behavior**: selection state + player seek/play logic.
7. **Export/validation tooling flows**: dataset download and validation report views.
8. **Presentation markup**: all sections and forms are directly embedded in one file.

This concentration increases regression risk and slows feature development because unrelated concerns must be edited together.

## Refactor goals

1. Preserve every existing workflow and validation behavior.
2. Keep `/` and `/matches/:id` lightweight routing approach (no React Router required now).
3. Keep shared contracts/models in `packages/shared`.
4. Normalize frontend API interaction patterns behind focused hooks/utilities.
5. Enable small, testable migration slices.
6. Avoid large new dependencies.

## Proposed target architecture

### 1) App shell and routing layer

- Keep existing browser-history approach.
- Move route parsing/navigation into a tiny `app/router` module.
- Keep `App.tsx` as a thin composition root only.

**Target responsibilities**

- `App.tsx`: instantiate API client, read route state, render page container.
- `app/router.ts`: `parseRoute`, `navigateTo`, route type definitions.
- `app/AppShell.tsx` (optional): shared page framing if needed.

### 2) Page containers

- `pages/MatchListPage.tsx`: container for match creation + list/filter behaviors.
- `pages/MatchDetailPage.tsx`: container for detail-level orchestration only.

Page containers should coordinate feature hooks and pass explicit props into presentational feature panels.

### 3) Feature modules (event, position, video, analytics, dataset, match)

Organize by feature with a consistent internal pattern:

- `components/` for presentational pieces
- `hooks/` for state + side-effect orchestration
- `utils/` for pure helper logic (formatters, mappers)

Example feature boundaries:

- `features/matches`: create/edit/delete/list/filter UI and state
- `features/events`: event timeline form/list CRUD logic
- `features/positions`: position timeline form/list CRUD logic
- `features/video`: video metadata form + player sync bindings
- `features/analytics`: analytics fetch/display panel
- `features/dataset-tools`: export + validation actions/presentation

### 4) Shared reusable hooks

Introduce lightweight hooks only where duplication exists:

- `useAsyncStatus` (optional): standard loading/error handling shape
- `useFormErrors` (optional): reset/set validation errors for forms
- `useRouteState`: wrapper around popstate subscription
- `useVideoSeekSelection`: selected event/position IDs + seek function

No global state library is required; local `useState`/`useEffect` remains sufficient for Phase 1.

### 5) API client utilities

Keep `matches-api.ts` as backend contract boundary; optionally split by concern without changing backend behavior:

- `api/matchesClient.ts` (or retain current file and expose grouped methods)
- `api/http.ts` for fetch boilerplate (if repeated)
- keep `MatchNotFoundError` handling centralized

## Proposed `apps/web/src` structure

```text
apps/web/src/
  app/
    App.tsx
    router.ts
    useRouteState.ts
  pages/
    MatchListPage.tsx
    MatchDetailPage.tsx
  features/
    matches/
      components/
        MatchCreateForm.tsx
        MatchList.tsx
        MatchFilters.tsx
      hooks/
        useMatchListPage.ts
        useMatchEditor.ts
        useMatchDelete.ts
    events/
      components/
        EventTimelinePanel.tsx
        EventForm.tsx
        EventList.tsx
      hooks/
        useEventTimeline.ts
    positions/
      components/
        PositionTimelinePanel.tsx
        PositionForm.tsx
        PositionList.tsx
      hooks/
        usePositionTimeline.ts
    video/
      components/
        VideoReviewPanel.tsx
        VideoMetadataForm.tsx
        VideoPlayer.tsx
      hooks/
        useMatchVideo.ts
        useVideoSeekSelection.ts
    analytics/
      components/
        AnalyticsPanel.tsx
      hooks/
        useMatchAnalytics.ts
    dataset-tools/
      components/
        DatasetToolsPanel.tsx
        DatasetValidationReport.tsx
      hooks/
        useDatasetTools.ts
  api/
    matches-api.ts
  shared/
    ui/
      AsyncState.tsx
      ErrorMessage.tsx
```

> Existing validation/domain helpers (`match.ts`, `timeline-event.ts`, `position-state.ts`, `match-video.ts`) can stay initially, then be relocated gradually under feature folders after tests are stable.

## Mapping current logic into module types

### Presentational components

Move mostly-UI JSX from `App.tsx` into components that receive typed props and callbacks only:

- forms (match/event/position/video)
- lists (match/event/position)
- analytics/dataset report rendering
- video info/player display

### Container / feature components

Page-level containers should compose feature hooks and wire interactions:

- `MatchListPage`: list/filter + create flow
- `MatchDetailPage`: orchestrates match core + panel composition

Feature panel containers can own feature-local orchestration (for example event CRUD state).

### Reusable hooks

Hooks should encapsulate side effects and state transitions:

- load lifecycle and error states
- submit/update/delete flows
- form mode transitions (create/edit/cancel)
- cross-feature callbacks (e.g., call `refreshAnalytics` after mutations)

### API utilities

Maintain one typed API contract layer and avoid fetch logic in components.

## Duplicated logic to consolidate

1. **Form toggle/reset patterns** are repeated across event/position/video sections.
2. **Loading/error boilerplate** repeats for each feature fetch.
3. **Sorted list update patterns** repeat for event and position CRUD.
4. **Submit lifecycle states** (`isSubmitting`, error reset, validation, success reset) repeat in multiple forms.
5. **Cancel-edit reset flows** repeat with near-identical behavior.

These should be consolidated via lightweight hooks/helpers, not heavyweight state frameworks.

## State management evaluation

Current local state approach is acceptable for Phase 1 if responsibilities are split into feature hooks.

Recommended small abstractions:

- feature-local hooks for each domain area
- optional tiny reducer for complex feature state if hook state transitions become difficult to reason about
- no Redux/Zustand/XState introduction at this stage unless complexity materially increases

## Implementation status update

- ✅ Slice 1 completed: routing primitives are extracted into `app/router.ts` and page orchestration now flows through `app/AppShell.tsx`.
- ✅ Slice 1 completed: match list + create flow extracted into `pages/MatchListPage.tsx`, `components/MatchCreateForm.tsx`, `components/MatchList.tsx`, and `hooks/useMatches.ts`.
- ✅ Slice 2 completed: match detail orchestration is extracted into `pages/MatchDetailPage.tsx`, and `App.tsx` remains a thin composition root.
- ✅ Slice 3 completed: event timeline annotation feature is extracted into `features/events` (`EventPanel`, `EventForm`, `EventList`, `useMatchEvents`) and wired through `MatchDetailPage` as a delegated module.
- ✅ Slice 4 completed: position timeline feature is extracted into `features/positions` (`PositionPanel`, `PositionForm`, `PositionList`, `useMatchPositions`) and wired through `MatchDetailPage` as a delegated module.
- ✅ Slice 5 completed: video review feature is extracted into `features/video` (`VideoPanel`, `VideoMetadataForm`, `useMatchVideo`) and wired through `MatchDetailPage` for seek coordination with events and positions.
- ✅ Slice 6 completed: analytics summary feature is extracted into `features/analytics` (`AnalyticsPanel`, `AnalyticsSummary`, `useMatchAnalytics`) and wired through `MatchDetailPage` for mutation-driven refresh behavior.

## Incremental migration plan (ordered, small slices)

1. **Baseline safety checks**
   - freeze current behavior with additional high-value tests where gaps exist
   - ensure existing tests pass before refactor changes

2. **Extract routing primitives**
   - move `AppRoute`, `parseRoute`, `navigateTo`, `popstate` handling into `app/router.ts` + `useRouteState`
   - keep rendered UI unchanged

3. **Extract page components without behavior changes**
   - move `MatchListPage` and `MatchDetailPage` into `pages/`
   - keep current props/state logic intact

4. **Extract match list/create feature components**
   - split create form, filters, and list display into presentational components
   - preserve current `useState` in page container initially

5. **Extract event timeline module**
   - ✅ completed: moved event form/list JSX + handlers into `features/events`
   - ✅ completed: created `useMatchEvents` for event CRUD/form state

6. **Extract position timeline module**
   - ✅ completed: moved position form/list JSX + handlers into `features/positions`
   - ✅ completed: created `useMatchPositions` for position CRUD/form state

7. **Extract video review module**
   - ✅ completed: video metadata/player UI + CRUD orchestration moved into `features/video`

8. **Extract analytics summary module**
   - ✅ completed: analytics summary fetch/render behavior moved into `features/analytics`
   - ✅ completed: event/position mutation flows continue to refresh analytics through `MatchDetailPage` orchestration

9. **Extract dataset tools module**
   - isolate dataset export/validation panel and keep current behavior unchanged
   - keep API signatures unchanged

10. **Consolidate shared UI primitives**
   - introduce tiny shared components/hooks for repeated async/error/form patterns

11. **Stabilization pass**
   - remove dead code, align naming, update tests/docs, verify root scripts

## Regression risks and mitigations

1. **Route behavior drift**
   - risk: broken navigation on `/matches/:id`
   - mitigation: routing unit tests + app-level navigation integration tests

2. **Validation regression**
   - risk: losing current frontend validation constraints
   - mitigation: keep validation functions unchanged initially; add component tests asserting exact error messages

3. **Cross-feature refresh failures**
   - risk: analytics not refreshing after event/position mutations
   - mitigation: integration tests for create/edit/delete event/position + analytics update

4. **Video seek synchronization breakage**
   - risk: event/position clicks no longer seek video
   - mitigation: focused UI tests around selection + `currentTime` changes on mocked video element

5. **Dataset tooling regressions**
   - risk: export or validation actions stop working
   - mitigation: maintain application-level tests for export invocation and validation report rendering

6. **State reset bugs during edit/cancel**
   - risk: stale form values/errors persist unexpectedly
   - mitigation: component tests for create/edit/cancel transitions on each panel

## Test strategy for refactor safety

### Keep at application integration level

- route switching between list and detail
- create match and land on detail page
- match edit/delete workflows
- event + position CRUD with analytics refresh expectations
- video attach/edit/remove + timeline seek actions
- dataset export trigger + validation report rendering

### Add or strengthen component/feature tests

- `MatchCreateForm`: required-field and length validations
- `MatchFilters`: competitor/hasVideo filter callback behavior
- `EventForm` / `PositionForm` / `VideoMetadataForm`: validation + submit/cancel semantics
- `EventList` / `PositionList`: render ordering + edit/delete callback wiring
- `DatasetValidationReport`: severity-group rendering and empty-state handling

### Validation and error-state coverage

- API failure messages for each feature panel
- not-found match state
- loading states for each async section
- no-data empty states for list/panels

## Documentation updates needed

1. Update `README.md` frontend section with a brief architecture map once file moves begin.
2. Add a short “where new frontend logic belongs” contributor guide in `apps/web/README.md` (or `Guidelines/`).
3. Document feature-folder conventions (components/hooks/utils split).
4. Document rule: shared contracts stay in `packages/shared`; frontend imports from shared package only.

## Assumptions made

1. Existing backend endpoints and payload contracts remain stable.
2. Existing validation helper modules remain source-of-truth during early migration.
3. Existing tests are passing and can be expanded incrementally.
4. Lightweight custom routing remains sufficient for two-route scope.
5. No requirement exists for SSR or complex nested navigation in Phase 1.

## Recommended first implementation slice

**Slice 1: Routing + page extraction (lowest risk, high leverage)**

- Extract routing helpers (`parseRoute`, `navigateTo`, `useRouteState`)
- Move `MatchListPage` and `MatchDetailPage` into `pages/` files with near-zero logic change
- Keep feature internals untouched in this slice

Why first:

- reduces `App.tsx` size immediately
- creates stable seams for subsequent feature extraction
- minimal behavior change risk
- easy to validate with existing application tests
