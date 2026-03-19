# ScrambleIQ
## Phase 1 Closeout Checklist

This checklist defines binary closeout gates for Phase 1.

Each gate is **PASS** or **FAIL** only (no partial credit).
Phase 1 closeout is approved only when every gate is PASS with evidence.

---

## Quality and Build Gates

- [ ] **PASS / FAIL:** `npm run lint`
- [ ] **PASS / FAIL:** `npm run typecheck`
- [ ] **PASS / FAIL:** `npm run test`
- [ ] **PASS / FAIL:** `npm run build`
- [ ] **PASS / FAIL:** `npm run test:integration`

## CI Gates

- [ ] **PASS / FAIL:** `validate` job is green
- [ ] **PASS / FAIL:** `integration-postgres` job is green

## Documentation Alignment Gates

- [ ] **PASS / FAIL:** `Guidelines/Roadmap.md` reflects the implemented manual-first direction
- [ ] **PASS / FAIL:** `Guidelines/Version-1-Scope.md` matches implemented Version 1 capabilities
- [ ] **PASS / FAIL:** `README.md` persistence/runtime wording is consistent (`DATABASE_URL` => PostgreSQL, otherwise in-memory fallback)

## Minimum Coach Workflow Acceptance Scenarios (Documented)

The scenarios below define the minimum end-to-end manual coaching workflow that must be available for Phase 1 closeout:

1. [ ] **PASS / FAIL:** Create, edit, and delete a match
2. [ ] **PASS / FAIL:** Create, edit, and delete event annotations
3. [ ] **PASS / FAIL:** Create, edit, and delete position annotations
4. [ ] **PASS / FAIL:** Attach, edit, and delete video metadata
5. [ ] **PASS / FAIL:** Seek synchronized playback from event and position timeline selections
6. [ ] **PASS / FAIL:** Review derived analytics generated from manual annotations
7. [ ] **PASS / FAIL:** Run dataset validation and produce deterministic JSON export

---

## Exit Criteria

Phase 1 is formally complete only when:

1. every gate above is marked PASS
2. local validation evidence is captured
3. CI evidence is captured for both required jobs
