# ScrambleIQ Security Baseline Audit (Phase-One Baseline)

## 1. Executive Summary

ScrambleIQ’s current baseline shows **no Critical findings** and **no immediately exploitable High findings in the current single-tenant, in-memory internal setup**. The codebase demonstrates good foundational validation on core match/event payloads and rejects unknown fields for those endpoints.

The largest risks are **readiness gaps** that become serious as soon as the product becomes multi-user or internet-exposed:

- no authentication/authorization model yet,
- no ownership checks on resources,
- no global Nest validation enforcement,
- limited abuse-case test coverage,
- no lightweight secure-development guardrails yet (e.g., dependency audit gates, threat checklist in PR flow).

Overall posture: **secure enough for early internal scaffold usage, but fragile for expansion without targeted hardening**.

## 2. Current Security Posture

### Snapshot
- Frontend (`apps/web`) is a React SPA that calls backend APIs with `fetch`.
- Backend (`apps/api`) is a NestJS REST API with in-memory storage.
- Shared contracts (`packages/shared`) provide TypeScript interfaces (compile-time only).

### Positive controls present
- API payload validation is explicitly enforced in service layer for create/update match and event flows.
- Unknown payload fields are rejected in validation helpers.
- Timeline-event match existence is checked before create/list operations.
- Match deletion cascades to timeline events.
- UI renders user data through React (escaped by default), reducing direct DOM XSS risk.

### Baseline risk profile
- **Current exploitable risk is low-to-moderate** in isolated internal use.
- **Future risk is moderate-to-high** once auth/users/persistent storage are introduced without redesign.

## 3. Findings by Severity

### Critical
- None.

### High
- None for current single-user/internal baseline.

### Medium

#### F-01: Missing authentication and authorization boundary
- **Severity:** Medium now, escalates to High with multi-user rollout.
- **Affected files:** `apps/api/src/matches/matches.controller.ts`, `apps/api/src/matches/events.controller.ts`, `apps/api/src/matches/matches.service.ts`, `apps/api/src/matches/events.service.ts`.
- **Risk:** All CRUD endpoints are publicly callable with no identity checks.
- **Failure mode:** Any caller who can reach API can create/update/delete all records.
- **Remediation:** Add explicit authn/authz plan before persistent/multi-user launch (route guards + ownership checks).
- **Fix timing:** **Fix now (design + scaffolding)**; full enforcement can be deferred until multi-user feature branch.
- **Standards mapping:** OWASP Top 10 A01 Broken Access Control; ASVS V4 Access Control; WSTG-ATHZ; NIST SSDF PW.5/RV.

#### F-02: Global validation pipe is a pass-through (no framework-level enforcement)
- **Severity:** Medium.
- **Affected files:** `apps/api/src/common/pipes/global-validation.pipe.ts`, `apps/api/src/configure-app.ts`.
- **Risk:** Validation currently depends on manual service calls. New endpoints could accidentally skip validation.
- **Failure mode:** Future endpoint added without manual validator may accept malformed or over-permissive payloads.
- **Remediation:** Replace pipe with Nest `ValidationPipe` configuration (`whitelist`, `forbidNonWhitelisted`, `transform`) and DTO decorators.
- **Fix timing:** **Fix now** as baseline control.
- **Standards mapping:** OWASP Top 10 A03 Injection (preventive input handling), ASVS V5 Validation, WSTG-INPV, NIST SSDF PW.4.

#### F-03: No resource ownership model (IDOR-ready design)
- **Severity:** Medium now, High later.
- **Affected files:** `apps/api/src/matches/matches.service.ts`, `apps/api/src/matches/events.service.ts`, `apps/api/src/matches/store/in-memory-match-store.ts`.
- **Risk:** Resource operations key only on `id`; no owner/tenant dimension exists.
- **Failure mode:** After auth is added, endpoints could remain vulnerable to cross-user object access.
- **Remediation:** Add owner/tenant field to domain model and enforce in query/update/delete paths.
- **Fix timing:** **Design now, enforce before multi-user release**.
- **Standards mapping:** OWASP Top 10 A01, ASVS V4.2 (access control on objects), WSTG-ATHZ-04.

### Low

#### F-04: No input length limits on string fields
- **Severity:** Low.
- **Affected files:** `apps/api/src/matches/match-validation.ts`, `apps/api/src/matches/timeline-event-validation.ts`.
- **Risk:** Oversized payloads can increase memory/response overhead; could become DoS vector with persistent storage.
- **Failure mode:** Very large strings accepted for title/ruleset/notes/eventType.
- **Remediation:** Add conservative max lengths and negative tests.
- **Fix timing:** **Fix now** (low effort).
- **Standards mapping:** OWASP Top 10 A04 Insecure Design, ASVS V5, WSTG-INPV-04.

#### F-05: Date validation accepts syntactically valid but calendar-invalid dates
- **Severity:** Low.
- **Affected files:** `apps/api/src/matches/match-validation.ts`.
- **Risk:** Data integrity issue; can break downstream logic relying on real calendar dates.
- **Failure mode:** Values like `2026-02-31` can pass parse-based checks.
- **Remediation:** Enforce strict date semantics (e.g., compare normalized ISO parts after parse).
- **Fix timing:** **Fix now**.
- **Standards mapping:** ASVS V5 Validation; WSTG-INPV.

#### F-06: Missing API hardening middleware (security headers/rate limiting)
- **Severity:** Low (current internal scope).
- **Affected files:** `apps/api/src/configure-app.ts`.
- **Risk:** Limited default protection against automated abuse and browser hardening expectations.
- **Failure mode:** Easy brute-force/automation when publicly exposed.
- **Remediation:** Add `helmet`; add minimal rate-limiting strategy for write endpoints when externalized.
- **Fix timing:** **Deferred until external exposure**, but add checklist now.
- **Standards mapping:** OWASP Top 10 A05 Security Misconfiguration, ASVS V14 Config, WSTG-CONF.

#### F-07: Client API path construction does not encode IDs
- **Severity:** Low.
- **Affected files:** `apps/web/src/matches-api.ts`.
- **Risk:** Path confusion if IDs contain reserved URL characters in future.
- **Failure mode:** Unexpected endpoint paths from malformed IDs.
- **Remediation:** Apply `encodeURIComponent` for all path parameters.
- **Fix timing:** **Fix now** (small).
- **Standards mapping:** ASVS V5 input handling; WSTG-INPV.

### Informational

#### F-08: Error messages expose resource existence details
- **Severity:** Informational.
- **Affected files:** `apps/api/src/matches/matches.service.ts`, `apps/api/src/matches/events.service.ts`.
- **Risk:** Enables entity enumeration in internet-facing deployments.
- **Failure mode:** Distinct 404 messages reveal whether resource IDs exist.
- **Remediation:** Keep detailed messages in logs; consider generic client errors for external mode.
- **Fix timing:** Deferred until exposure changes.
- **Standards mapping:** OWASP Top 10 A09 Logging/Monitoring (error handling discipline), ASVS V10.

#### F-09: Dependency vulnerability scanning is not currently enforceable in this environment
- **Severity:** Informational.
- **Affected artifacts:** root `package.json`, `package-lock.json` workflow.
- **Risk:** Unknown package CVEs may remain unnoticed without regular scanning.
- **Failure mode:** vulnerable transitive dependency enters build.
- **Remediation:** Add CI step for `npm audit` (or OSV/Snyk equivalent) with baseline triage policy.
- **Fix timing:** Deferred but recommended soon.
- **Standards mapping:** NIST SSDF PO.3 / RV.1; OWASP A06 Vulnerable Components.

## 4. File-by-File Findings

- `apps/api/src/common/pipes/global-validation.pipe.ts`: pass-through transform only; no schema enforcement.
- `apps/api/src/configure-app.ts`: CORS present but no broader API hardening middleware.
- `apps/api/src/matches/*.controller.ts`: all endpoints unguarded.
- `apps/api/src/matches/*.service.ts`: explicit validation exists; no authz/ownership checks.
- `apps/api/src/matches/match-validation.ts`: unknown fields rejected; strict required fields; no max lengths; date check is parse-based.
- `apps/api/src/matches/timeline-event-validation.ts`: required checks and unknown-field rejection; no max lengths.
- `apps/api/src/matches/store/in-memory-match-store.ts`: shared in-memory store with no tenant partition; design fragile for multi-user.
- `apps/web/src/matches-api.ts`: direct URL interpolation for IDs, no encoding.
- `apps/web/src/App.tsx`: route parsing and rendering are simple; React escaping reduces direct XSS risk.
- `packages/shared/src/index.ts`: contracts include no auth/owner dimensions (expected now, but future gap).
- `README.md`: documents validation and local env defaults; no secret leakage observed.

## 5. API Security Review

### Endpoint inventory
- `GET /health`
- `POST /matches`
- `GET /matches`
- `GET /matches/:id`
- `PATCH /matches/:id`
- `DELETE /matches/:id`
- `POST /matches/:id/events`
- `GET /matches/:id/events`
- `PATCH /events/:id`
- `DELETE /events/:id`

### API observations
- No authentication or authorization controls on any endpoint.
- Create/update payloads use manual validator functions in service layer.
- Unknown fields are rejected for match and timeline payloads.
- 404 and 400 status behavior is generally consistent.
- Event update/delete operate by event ID only; no parent-match or owner validation.
- Delete match cascades event deletion (good integrity behavior).

### API abuse scenarios
- Full data tampering by any reachable client (current no-auth model).
- Future IDOR once multi-user exists (guess/obtain UUID then access/modify).
- Oversized body abuse via unconstrained string fields.

## 6. Frontend Security Review

### Client/API interaction
- Uses `fetch` with JSON body for writes; handles 404 via typed error wrappers.
- API base URL comes from `VITE_API_BASE_URL` with localhost fallback.

### UI rendering and route behavior
- User-provided text is rendered via React JSX (escaped by default), limiting direct script injection.
- Route parsing uses regex and `decodeURIComponent`; unknown routes fall back to list page.
- No risky `dangerouslySetInnerHTML` patterns found.

### Frontend fragility areas
- ID interpolation in request paths should be URL-encoded.
- No auth/session layer yet; future token handling needs centralized secure client module.

## 7. Architecture and Future Risk Review

### Trust boundaries
1. Browser (attacker-controllable) -> API over HTTP.
2. API controllers/services -> in-memory store (trusted internal process memory).
3. Shared types are compile-time only and provide no runtime security.

### Attacker-controlled inputs
- All route params (`:id`) and all request bodies.
- Frontend form fields and direct URL navigation path.

### Secure now but fragile later patterns
- Manual validation in services (works now; easy to bypass in future endpoints).
- Single-process in-memory store (no persistence controls, no tenancy boundaries).
- Flat UUID object model without ownership metadata.

### Authorization insertion points for future
- Controller guards for authn.
- Service/store filtering by owner/tenant ID.
- Event operations should verify parent match ownership context.

## 8. Test Coverage Gaps

### Covered today
- Happy-path CRUD for matches/events.
- Invalid payload checks for type/required/unknown fields.
- Not-found behavior on missing resources.
- Frontend validation and primary interaction flows.

### Missing security-focused tests
- Authz/ownership test skeletons (even if pending/expected-fail placeholders).
- Oversized string payload rejection tests.
- Strict invalid-date tests.
- Fuzz/abuse tests for malformed route IDs and encoded delimiters.
- CORS policy tests for denied origins.
- Regression tests ensuring future endpoints cannot skip validation.

## 9. Recommended Immediate Fixes

1. Replace pass-through global pipe with Nest `ValidationPipe` + DTO decorators.
2. Add max-length constraints for all string fields (API + tests).
3. Tighten date validation to enforce real calendar dates.
4. Encode all path params in frontend API client (`encodeURIComponent`).
5. Add lightweight “authorization-ready” model fields (`ownerId` placeholder) and TODO tests.

## 10. Recommended Deferred Fixes

1. Implement full authn/authz before external or multi-user rollout.
2. Add rate limiting and expanded security headers once API is externally reachable.
3. Introduce persistent data-store security controls (least privilege DB account, migration checks).
4. Add CI dependency scanning gate with triage policy.
5. Add lightweight threat-model checklist to PR template.

## 11. Security Baseline Checklist for Future Features

Use this checklist for each new feature PR:

1. **Trust boundary update** documented (new inputs, new data flows).
2. **Authentication requirement** explicitly stated (public/internal/user-scoped).
3. **Authorization rule** defined per endpoint (who can read/write/delete).
4. **IDOR check** included for all resource-by-id operations.
5. **Runtime validation** with DTO decorators + global ValidationPipe.
6. **Unknown fields rejected** and tested.
7. **String lengths constrained** and tested (upper bounds).
8. **Date/time semantics validated** (not just parseable).
9. **Error responses sanitized** for external mode.
10. **Security tests added** (negative + abuse cases).
11. **Dependency risk reviewed** (audit/scanner output checked).
12. **Secure now but fragile later** items documented as explicit follow-ups.

---

## Proposed Code Changes (for follow-up implementation)

If implementing the above recommendations, change these files first:

1. `apps/api/src/common/pipes/global-validation.pipe.ts`
   - Replace custom no-op pipe with Nest `ValidationPipe` config.
2. `apps/api/src/matches/create-match.dto.ts`, `update-match.dto.ts`, `create-timeline-event.dto.ts`, `update-timeline-event.dto.ts`
   - Add class-validator decorators (`IsString`, `IsNotEmpty`, `IsInt`, `Min`, `MaxLength`, etc.).
3. `apps/api/src/matches/match-validation.ts`, `timeline-event-validation.ts`
   - Remove duplicated custom logic after decorator-based validation is proven equivalent.
4. `apps/web/src/matches-api.ts`
   - Encode all route params with `encodeURIComponent`.
5. `apps/api/test/matches.e2e.test.ts` and web/API validation tests
   - Add negative tests for max length, strict date validity, and malformed identifiers.

Why: these changes provide the highest security leverage with minimal architectural churn at current project stage.
