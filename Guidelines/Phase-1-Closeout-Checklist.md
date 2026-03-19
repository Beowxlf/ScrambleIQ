# ScrambleIQ
## Phase 1 Closeout Checklist

This checklist defines binary gates for Phase 1 closeout.

A gate is complete only when evidence exists in local validation output and/or CI results.

---

## Quality and Build Gates

- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes
- [ ] `npm run test` passes
- [ ] `npm run build` passes
- [ ] `npm run test:integration` passes

## CI Gates

- [ ] `validate` job is green
- [ ] `integration-postgres` job is green

## Documentation Alignment Gates

- [ ] `Guidelines/Roadmap.md` reflects manual-first implemented baseline
- [ ] `Guidelines/Version-1-Scope.md` matches implemented Version 1 capabilities
- [ ] `README.md` persistence/runtime wording is internally consistent (PostgreSQL when `DATABASE_URL` is set, in-memory fallback otherwise)

## Product Acceptance Documentation Gate

- [ ] Minimum coach workflow acceptance scenarios are documented and phase-appropriate:
  - [ ] create/edit/delete match
  - [ ] create/edit/delete event annotations
  - [ ] create/edit/delete position annotations
  - [ ] attach/edit/delete video metadata
  - [ ] synchronized playback seek from event and position selections
  - [ ] analytics review from manual annotations
  - [ ] dataset validation and JSON export

---

## Exit Criteria

Phase 1 closeout is approved only when every gate above is checked.
