# Security Review — Backend and Data Handling (2026-03-19)

## Status update (implemented after this review)

- Baseline API authentication is now implemented with a shared-token guard that protects all non-public routes.
- `GET /health` remains public for liveness checks; match/event/position/video/analytics/export/validate endpoints now require a token and return `401` when missing/invalid.
- This is a phase-appropriate authentication gate only; resource ownership and multi-tenant authorization are still future work.

## Scope reviewed

- Backend API request handling, validation, service logic, persistence abstractions, SQL execution helpers, migrations, and dataset export/validation paths.
- Frontend data-handling code for API error propagation and dataset/video-related flows.

## Security strengths

1. **Route parameter validation is consistently applied for IDs**
   - Controllers use `ParseUUIDPipe` on route IDs, reducing malformed identifier input risk.
2. **Unknown field rejection is implemented for body payloads and list query params**
   - Create/update validators reject unsupported fields.
   - List query validator rejects non-allowed query parameters.
3. **Input constraints are enforced for key domain fields**
   - Strict date parsing (`YYYY-MM-DD`) for match dates.
   - Non-negative integer timestamp checks and enum-like validation for competitor and position values.
4. **Persistence integrity has baseline DB constraints**
   - Foreign keys, competitor check constraints, and `timestamp_end > timestamp_start` in SQL schema.
5. **Client request URLs encode user-controlled path segments**
   - Frontend API client uses `encodeURIComponent` for IDs in route construction.

## Security weaknesses

1. **No authentication/authorization layer is present**
   - All match/event/position/video/dataset endpoints are reachable without identity checks.
2. **SQL execution uses custom string interpolation rather than parameterized queries**
   - Current `sqlLiteral` escaping is broad, but this pattern is fragile and easier to misuse over time.
3. **CORS can be overly permissive under misconfiguration**
   - If `WEB_ORIGIN` is unset in non-local deployments, default allows localhost origin, but there is no environment hardening guard.
4. **Error responses include internal identifier values**
   - NotFound messages return raw resource IDs.
5. **Fallback persistence mode can create unsafe operational assumptions**
   - Missing `DATABASE_URL` silently switches to in-memory repositories, which risks data loss and inconsistent security posture between environments.
6. **`sourceUrl` lacks URL/scheme allowlisting**
   - Backend accepts arbitrary strings for video source URLs.

## Findings by severity

### Critical findings

1. **Missing authentication and authorization across API surface**
   - Impact: Any caller with network access can read/modify/delete all match artifacts and export validation/report data.
   - Evidence: Controllers and services expose CRUD/analytics/export/validate endpoints without guards/interceptors/policy checks.

### Medium findings

1. **SQL construction relies on custom escaping instead of parameter binding**
   - Impact: No immediate exploit identified in reviewed code because literals are escaped centrally, but security margin depends on every future call site using `sqlLiteral` correctly.
2. **Operational risk from silent in-memory fallback when `DATABASE_URL` is absent**
   - Impact: Can lead to accidental non-durable runtime in environments expected to persist audit-relevant annotations, creating integrity and traceability issues.
3. **Arbitrary `sourceUrl` accepted for stored video metadata**
   - Impact: Allows unsafe URL schemes or internal network targets to be stored and consumed by clients, increasing abuse potential depending on deployment context.

### Low findings

1. **Verbose not-found error strings include raw IDs**
   - Impact: Minor resource-enumeration signal; useful for debugging but leaks identifier existence context.
2. **Validation errors are returned directly as detailed arrays**
   - Impact: Helpful for clients; low-risk information disclosure in this domain, but still detailed field-level behavior exposure.

## Recommended mitigations (no scope expansion)

1. **Add baseline authn/authz gate before production exposure**
   - Minimum practical mitigation: Require authenticated access globally and enforce ownership/tenant checks on every `:id` read/write route.
2. **Move SQL execution to parameterized statements**
   - Keep repository interfaces unchanged; replace string-interpolated SQL internals with parameterized query usage in `PsqlClient` and repositories.
3. **Fail closed on persistence mode in non-development environments**
   - Example: if `NODE_ENV` is `production` and `DATABASE_URL` is missing, prevent startup with explicit error.
4. **Constrain `sourceUrl` inputs**
   - Validate URL format and allowlist schemes (`https` and controlled local/dev scheme if needed).
5. **Harden error messaging defaults**
   - Preserve detailed errors in development; reduce identifier-specific details in production responses.
6. **Document security expectations explicitly**
   - Add a short “Security posture” section in README clarifying current non-authenticated phase status and deployment constraints.

## Assumptions made

1. Current repository is phase-one and may intentionally prioritize developer velocity over full production hardening.
2. No hidden auth or API gateway controls were assumed outside this codebase.
3. Review reflects code state on 2026-03-19 and does not claim exploitability beyond what is directly supported by current implementation.
