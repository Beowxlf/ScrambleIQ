# ScrambleIQ Security Remediation Plan (Phase-One)

This plan converts the baseline findings into concrete, scoped engineering work for the current repository phase.

## Scope and assumptions

- Scope is current monorepo (`apps/api`, `apps/web`, `packages/shared`) in early phase-one scaffold.
- Prioritization favors low-friction controls that reduce future redesign risk.
- No enterprise-only controls are required at this stage.

## 1) Prioritized task list by remediation window

## Fix now (next feature prerequisite)

### R-01: Replace pass-through global validation with Nest runtime validation
- **Finding source:** F-02 (medium)
- **Task:** Replace `GlobalValidationPipe` no-op behavior with a proper Nest validation pipeline and DTO constraints.
- **Actionable engineering steps:**
  1. In `apps/api/src/configure-app.ts`, configure a strict global `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`).
  2. Add `class-validator` / `class-transformer` DTO decorators in:
     - `apps/api/src/matches/create-match.dto.ts`
     - `apps/api/src/matches/update-match.dto.ts`
     - `apps/api/src/matches/create-timeline-event.dto.ts`
     - `apps/api/src/matches/update-timeline-event.dto.ts`
  3. Keep current service-level validators during transition, then remove duplicate logic once parity tests pass.
- **Complexity:** Medium
- **Should be done before next feature?** Yes
- **Sprint candidate:** Can start before sprint; complete in hardening sprint if feature pressure exists.
- **Status:** ✅ Completed

### R-02: Add server-side max-length constraints to all user text fields
- **Finding source:** F-04 (low, abuse-prevention baseline)
- **Task:** Enforce consistent max lengths for title/ruleset/competitor names/eventType/notes.
- **Actionable engineering steps:**
  1. Define constants in API validation layer (or DTO decorators).
  2. Apply limits in both create and update flows.
  3. Return clear validation messages.
  4. Mirror constraints in frontend form validation to improve UX.
- **Complexity:** Small-Medium
- **Should be done before next feature?** Yes
- **Sprint candidate:** Yes
- **Status:** ✅ Completed

### R-03: Tighten date validation semantics
- **Finding source:** F-05 (low)
- **Task:** Reject calendar-invalid dates while preserving `YYYY-MM-DD` format.
- **Actionable engineering steps:**
  1. Validate strict format.
  2. Parse and re-check normalized year/month/day to ensure true calendar validity.
  3. Add regression tests for leap year and invalid day/month values.
- **Complexity:** Small
- **Should be done before next feature?** Yes
- **Sprint candidate:** Yes
- **Status:** ✅ Completed

### R-04: URL-encode all frontend API path params
- **Finding source:** F-07 (low)
- **Task:** Eliminate path ambiguity by encoding IDs before request path interpolation.
- **Actionable engineering steps:**
  1. Update all match/event ID usages in `apps/web/src/matches-api.ts` to use `encodeURIComponent`.
  2. Add unit tests for IDs containing reserved characters.
- **Complexity:** Small
- **Should be done before next feature?** Yes
- **Sprint candidate:** Yes
- **Status:** ✅ Completed

## Fix before auth/multi-user support

### R-05: Add ownership model to core domain objects
- **Finding source:** F-03 (medium -> high with multi-user)
- **Task:** Introduce `ownerId` (or tenant key) and enforce access checks in service/store operations.
- **Actionable engineering steps:**
  1. Extend shared contracts in `packages/shared/src/index.ts` with owner metadata.
  2. Thread owner context through API service methods.
  3. Ensure event operations validate both event ownership and parent match ownership.
  4. Add authorization test matrix for read/update/delete by owner vs non-owner.
- **Complexity:** Medium-High
- **Should be done before next feature?** Only if next feature introduces user identities; otherwise no.
- **Sprint candidate:** Yes (core security-hardening sprint item)

### R-06: Define and implement baseline authn/authz guards
- **Finding source:** F-01 (medium -> high)
- **Task:** Introduce minimum viable auth guard strategy for protected endpoints.
- **Actionable engineering steps:**
  1. Define auth boundary and endpoint policy (`public`, `internal`, `user-owned`).
  2. Add guard scaffolding in API module.
  3. Enforce ownership checks at service layer (defense in depth).
  4. Add route-level tests for unauthorized/forbidden behavior.
- **Complexity:** High
- **Should be done before next feature?** Only if next feature is user-facing identity/auth dependent.
- **Sprint candidate:** Yes (primary hardening sprint work).

## Fix before production

### R-07: Add API hardening middleware and abuse controls
- **Finding source:** F-06 (low now)
- **Task:** Baseline hardening for external exposure.
- **Actionable engineering steps:**
  1. Add security headers middleware (`helmet`).
  2. Add write-endpoint rate limiting with safe defaults.
  3. Validate CORS policy for production origins.
- **Complexity:** Medium
- **Should be done before next feature?** No
- **Sprint candidate:** Yes (pre-production hardening track)

### R-08: Standardize external error response strategy
- **Finding source:** F-08 (informational)
- **Task:** Avoid unnecessary resource-enumeration detail in public mode.
- **Actionable engineering steps:**
  1. Create exception filter strategy for external responses.
  2. Keep detailed messages in logs, return generalized client errors where appropriate.
- **Complexity:** Medium
- **Should be done before next feature?** No
- **Sprint candidate:** Yes

## Monitor

### R-09: Establish dependency vulnerability monitoring in CI
- **Finding source:** F-09 (informational)
- **Task:** Add lightweight dependency security checks with triage policy.
- **Actionable engineering steps:**
  1. Add CI audit step (`npm audit` and/or OSV scanner).
  2. Define fail/waive thresholds and response SLA.
  3. Document workflow in README or contributor guidance.
- **Complexity:** Small-Medium
- **Should be done before next feature?** No
- **Sprint candidate:** Can be bundled with hardening sprint or implemented independently.

### R-10: Track “secure now but fragile later” items as explicit backlog policy
- **Finding source:** architecture notes from baseline
- **Task:** Require explicit security follow-ups when introducing temporary controls.
- **Actionable engineering steps:**
  1. Add security follow-up section to PR template.
  2. Require owner/date for deferred risk items.
- **Complexity:** Small
- **Should be done before next feature?** Recommended, but not blocking.
- **Sprint candidate:** Yes

## 2) Proposed order of work

1. **R-01 ValidationPipe + DTO enforcement** (highest leverage foundation)
2. **R-02 Max lengths** (abuse reduction + data quality)
3. **R-03 Strict date semantics** (data integrity)
4. **R-04 Path param encoding in web client** (robustness hardening)
5. **R-09 Dependency monitoring setup** (quick process win)
6. **R-05 Ownership model** (before multi-user)
7. **R-06 Auth guard and authorization policy** (before multi-user/user auth)
8. **R-07 Production middleware hardening** (before public launch)
9. **R-08 Error response strategy** (before public launch)
10. **R-10 PR security follow-up governance** (ongoing)

## 3) Security-hardening sprint bundle proposal

Recommended dedicated sprint bundle:
- **Sprint A (now / next):** R-01, R-02, R-03, R-04, R-09
- **Sprint B (pre-auth/multi-user):** R-05, R-06
- **Sprint C (pre-production):** R-07, R-08, R-10

## 4) Required test additions (high + medium issues)

## For F-01 / R-06 (authn/authz boundary)
- API tests:
  - Unauthenticated request to protected endpoints returns `401`.
  - Authenticated user without ownership returns `403` for read/update/delete.
  - Authenticated owner succeeds for all permitted operations.
- Abuse tests:
  - Cross-user direct object ID access is denied (IDOR regression suite).

## For F-02 / R-01 (global validation enforcement)
- API tests:
  - Unknown fields rejected at framework boundary for every create/update endpoint.
  - Type coercion behavior is explicit and tested (`transform` on/off expectations).
  - Endpoint without manual service validator still rejects malformed payloads.
- Regression tests:
  - Add one “new dummy endpoint” test pattern proving guardrail is global.

## For F-03 / R-05 (ownership model)
- API tests:
  - Match list returns only caller-owned resources.
  - Event list/create/update/delete enforce parent match ownership.
  - Deleting a match does not impact other owners’ events.
- Abuse tests:
  - Forged owner identifier in payload is ignored/rejected; owner derived from auth context only.

## 5) Architecture notes

- **Trust boundary contract:** Browser input remains attacker-controlled; shared types are not runtime enforcement.
- **Security control layering:** enforce validation globally (framework), then business invariants in services.
- **Authorization model target:** owner-scoped resource model with service-level checks and guard-level authentication.
- **Storage evolution note:** current in-memory assumptions must not be carried unchanged into persistent data layer.
- **Process note:** each new feature should include explicit security impact statement using checklist below.

## 6) Security checklist template for all future feature prompts

Copy/paste template:

```md
## Security Checklist (Required)

### Scope and trust boundaries
- [ ] I documented new/changed trust boundaries.
- [ ] I listed attacker-controlled inputs (body, params, query, headers, files).

### Authentication and authorization
- [ ] I specified whether endpoint/feature is public, internal, or authenticated.
- [ ] I enforced resource ownership/tenant checks for all resource-by-id operations.
- [ ] I added/updated tests for unauthorized (`401`) and forbidden (`403`) behavior where applicable.

### Validation and input handling
- [ ] Runtime validation is enforced (not frontend-only).
- [ ] Unknown fields are rejected.
- [ ] String lengths and numeric ranges are constrained.
- [ ] Date/time values are semantically valid, not only parseable.

### Output and error handling
- [ ] Untrusted content is rendered safely (no unsafe HTML injection patterns).
- [ ] Error responses avoid leaking sensitive internals in external mode.

### API and business logic invariants
- [ ] Update/delete operations enforce parent-resource and ownership invariants.
- [ ] Abuse cases (replay, tampering, malformed IDs) were considered and tested.

### Dependencies and configuration
- [ ] New dependencies were reviewed for necessity and maintenance health.
- [ ] Security-sensitive config/env usage is documented and safe by default.

### Testing and regression
- [ ] Added negative tests for validation and authz paths.
- [ ] Added regression tests for any discovered security bug.
- [ ] Lint, typecheck, test, and build passed at workspace root.

### Deferred risks
- [ ] Any “secure now but fragile later” item is documented with owner and follow-up milestone.
```
