# Phase 2 Discovery Sorting Decision

## Decision Scope
This document resolves the Phase 2 signoff ambiguity for discovery sorting in Scenario 4 of `Guidelines/Phase-2-Kickoff.md`.

## Current Implemented Discovery Behavior
- Match discovery supports search/filter inputs for competitor, date range, and has-video; plus pagination via page size and offset.
- Discovery ordering is fixed by backend deterministic ordering (newest `eventDate` first, tie-broken by `matchId` descending).
- There is no user-facing sorting control and no sort query parameter in the shared list contract.

## Phase 2 Acceptance Determination
**Accepted for Phase 2:** fixed deterministic ordering is sufficient for Scenario 4 acceptance.

## Rationale
- Scenario 4 acceptance signals require understandable filtering/search, clear result state, and straightforward transition to match detail/edit flow.
- Scenario 4 does not require user-controlled sorting UI as an explicit acceptance signal.
- Fixed deterministic ordering preserves list predictability and user confidence in displayed results, which aligns with the manual-first and deterministic product direction.

## Phase 3 Clarification
Interactive sorting (user-selectable sort fields/directions) is **deferred to Phase 3** unless Phase 2 scope is explicitly amended.
