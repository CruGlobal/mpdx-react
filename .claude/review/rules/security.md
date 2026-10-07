# Security — Focus Areas

Generic baseline. `/agent-review:init` appends the repo-specific concerns; keep both.

**Authentication & authorization boundaries**

- Every server endpoint, background job, and privileged action independently verifies the caller's
  identity — never trusts a user id, tenant id, or role passed in from the client
- Authorization is enforced at the data layer (row/tenant scoping, ACL check), not only by hiding UI
- Look for: endpoints added without a session/permission check; ownership checks that compare
  against client-supplied identifiers; policy changes that widen who can read or write a record

**Privileged clients & credentials**

- Admin/service-level clients that bypass normal access control must stay server-only and must never
  be importable from browser or otherwise untrusted code
- Look for: privileged clients imported into client-side modules; secrets read in code that ships to
  the browser; credentials committed to the repo or baked into build artifacts

**Secrets exposure**

- Server-only environment variables must not be exposed through client-visible prefixes, build-time
  inlining, or error payloads
- Look for: new environment-variable references; API keys or tokens in logs, error messages, HTTP
  responses, or analytics events

**Input validation & injection**

- Untrusted input (request bodies, query params, headers, webhooks, third-party payloads, file
  uploads) is validated against an explicit schema before use
- Look for: raw string interpolation into SQL/shell/HTML/templates; parsers fed unvalidated JSON;
  client-side validation with no server-side counterpart; unbounded sizes and counts

**Cross-site and browser-surface risks**

- Look for: raw-HTML injection sinks; unsanitized user content rendered as markup; open redirects
  where a redirect target comes from a query parameter without an allowlist check; missing CSRF
  protection on state-changing requests; weakened CSP or security headers

**Session & cookie handling**

- Look for: session cookies missing `HttpOnly`/`Secure`/`SameSite`; tokens stored where scripts can
  read them; sessions that are not invalidated on logout, password change, or privilege change;
  long-lived or non-rotating credentials

**Webhooks & third-party integrations**

- Look for: webhook handlers that parse and act on a payload before verifying the signature against
  the raw body; missing replay protection; secrets or tokens forwarded to the client

**Supply chain & CI**

- Look for: new dependencies (who maintains them, what they pull in); CI workflow changes that widen
  permission scopes, echo secrets, or let untrusted contributors trigger privileged jobs; changes to
  the review configuration itself that weaken risk scoring or strip checks

<!-- init: extend this file with repo-specific focus areas and evidence links -->

## MPDX React — Repo-Specific Focus Areas

**Where the real authorization boundary is**

MPDX's frontend holds _no_ authorization. Every query and mutation is authorized by the upstream
Rails API (`process.env.REST_API_URL`) or the native GraphQL API (`process.env.API_URL`), which scope
data to the caller's own account lists. Client-side gating is UX only:

- `useNavPages.tsx` (`canSeeHrTools`), `src/hooks/useIneligibleByGroup.ts`, and
  `src/components/Shared/UserTypeAccess/UserTypeAccess.tsx` (`RequiredUserGroupEnum`) hide tabs and
  pages. `src/hooks/useDeveloperBypass.ts` can bypass them.
- Do **not** accept a PR description that treats these as a security control, and do **not** flag a
  missing `UserTypeAccess` guard as a vulnerability on its own — flag it as a UX/consistency issue and
  say so explicitly. `src/components/HrTools/MinistryPartnerReminders` intentionally has no page
  guard for exactly this reason.
- Conversely, _do_ flag anything that moves an authorization decision **into** the client (e.g. a
  mutation whose variables carry a role, an `admin` flag, or another user's id derived from client
  state).

**NextAuth — `pages/api/auth/[...nextauth].page.ts`**

- The `redirect` callback is the open-redirect boundary: it allows `url.startsWith(baseUrl)`,
  relative `/…` URLs resolved against `baseUrl`, and one special case — `url === 'signOut'` under
  `AUTH_PROVIDER === 'OKTA'` redirects to `signon.okta.com` with
  `encodeURIComponent(process.env.OKTA_SIGNOUT_REDIRECT_URL)`. Everything else falls through to
  `baseUrl`. Any new branch here needs scrutiny.
- The `session` callback calls `isJwtExpired(apiToken)` and **throws** on expiry to force a re-login.
  `isJwtExpired` (in `helpers.ts`) base64-decodes the payload **without verifying the signature** —
  that is deliberate and correct for an expiry check, but it must never be repurposed as an
  authentication check.
- The `jwt` callback fetches `admin` / `developer` from the API via `GetUserAccess`. These flags come
  from the server; never set them from client input.
- The `API_OAUTH` provider declares `checks: ['pkce', 'state']` — removing either is a critical
  finding. Its `userinfo.request()` returns hardcoded placeholder values on purpose (the API returns
  the real user through the `apiOauthSignIn` mutation); don't "fix" it by trusting that object.
- `pages/api/auth/apiOauthSignIn.ts` is a **hand-committed generated file** because `apiOauthSignIn`
  exists only on the staging API, not production, "for security reasons". Regenerating or moving it
  into a `.graphql` file will break the production build.
- Startup guards throw when `AUTH_PROVIDER` is not exactly `OKTA` or `API_OAUTH`, or when the
  matching `OKTA_*` / `API_OAUTH_*` variables are missing. Keep them.

**Impersonation — `pages/api/auth/impersonate/**`, `pages/api/auth/helpers.ts`\*\*

This is the highest-risk surface in the repo. `impersonateHelper.ts`:

- rejects non-`POST` (405), requires a NextAuth token via `getToken({ req, secret: process.env.JWT_SECRET })`
  (401 otherwise), and type-checks `user`, `reason`, and `organizationId` off `JSON.parse(req.body)`
- forwards the **impersonator's own** `apiToken` to `admin/impersonation` or
  `organizations/<id>/impersonation` — the REST API decides whether impersonation is permitted
- `reason` is required and forwarded: it is the audit trail. Making it optional or defaulted is a
  finding
- it emits five `mpdx-handoff.*` cookies (`impersonate`, `token`, `accountConflictUserId`,
  `isImpersonatorDeveloper`, `redirect-url`) using `cookieDefaultInfo` from `pages/api/utils/cookies`

`helpers.ts` `setUserInfo()` consumes those cookies on the next sign-in and **immediately expires
every one of them** with `expireCookieDefaultInfo`. Any change that leaves a handoff cookie alive
after use, or adds a new handoff cookie without an expiry push, is a finding.

- `isImpersonatorDeveloper` is not passed as a plain boolean: `signValue()` HMAC-SHA256s
  `"<value>.<expiresAt>"` with `process.env.JWT_SECRET` (default 300 s TTL), and `verifySignedValue()`
  checks the expiry and compares with `crypto.timingSafeEqual` after a length check. Never replace
  that comparison with `===`, never drop the expiry, and never trust an unsigned client-supplied
  privilege flag.
- Impersonation UI lives under `src/components/Settings/*/ImpersonateUser/**`;
  `pages/api/stop-impersonating.page.ts` ends the session.

**REST proxy — `pages/api/graphql-rest.page.ts`**

- The Apollo Server context builds `new MpdxRestApi(req.headers.authorization ?? '')` per request, and
  `willSendRequest` copies that into the outgoing `Authorization` header. The empty-string fallback
  means an unauthenticated call is rejected upstream rather than proxied as a privileged one — keep
  it that way; don't substitute a service token.
- `errorFromResponse()` lifts `parsedBody.errors[0].detail` from the upstream into the GraphQL error
  message that reaches the browser. Anything the upstream puts in `detail` is user-visible — be wary
  of changes that widen what gets copied out of the REST response.
- The handler is wrapped in `Cors({ origin: 'https://studio.apollographql.com', allowCredentials: true })`.
  Widening that origin, or adding a wildcard, is a critical finding.
- `allowBatchedHttpRequests: true` matches the client's `BatchHttpLink`; disabling it breaks the app,
  enabling additional server plugins (introspection, landing pages) in production needs review.

**Apollo client link — `src/lib/apollo/link.ts`, `src/lib/apollo/client.ts`**

- `makeAuthLink(apiToken)` sets `Authorization: Bearer <token>` and an intentionally **empty**
  `Accept-Language` so the API falls back to the user's account language. Don't "fix" it to `en-US`.
- The global `onError` link signs the user out on `extensions.code === 'AUTHENTICATION_ERROR'`
  (`signOut` → `clearDatadogUser()` → `client.clearStore()`). Removing `clearStore()` leaks the
  previous user's cached data into the next session.
- Errors are toasted (`snackNotifications.error(graphQLError.message)`) and reported to Datadog
  (`reportGraphQLError` / `reportNetworkError`) and Rollbar. Never let a token or PII reach an error
  message that flows through here.

**Environment variables**

Server-only in this repo: `API_URL`, `REST_API_URL`, `JWT_SECRET`, `OKTA_CLIENT_ID`,
`OKTA_CLIENT_SECRET`, `OKTA_ISSUER`, `OKTA_SIGNOUT_REDIRECT_URL`, `API_OAUTH_CLIENT_ID`,
`API_OAUTH_CLIENT_SECRET`, `API_OAUTH_ISSUER_*`, `API_OAUTH_SCOPE`, `AUTH_PROVIDER`.

- Any new `NEXT_PUBLIC_`-prefixed variable, or any of the above referenced from a module reachable
  from the browser bundle, is a finding.
- `no-console` is an ESLint **error** repo-wide (`.eslintrc.js`), which incidentally catches token
  logging — treat a new `// eslint-disable-next-line no-console` near auth code as a red flag.

**Other browser-surface checks**

- XSS: `dangerouslySetInnerHTML`, `innerHTML`, direct DOM writes — flag every new use.
- Open redirect in components: `router.push(value)` / `window.location = value` where `value` derives
  from `router.query`. Note `MonthlyGoal.tsx` builds a contacts URL with
  `encodeURIComponent(JSON.stringify(filters))` — follow that encoding pattern.
- File uploads (`formidable`): `pages/api/uploads/**`, `pages/api/Schema/uploads/**` — content-type
  allowlist, size limit, filename sanitization (path traversal), scoped upload tokens.
- GraphQL operations must never be built by string concatenation; only variables.
- `apollo3-cache-persist` writes the whole normalized cache to `localStorage` in production
  (`src/lib/apollo/client.ts`). Anything newly cached is newly readable by any script on the origin —
  scrutinize new queries that pull sensitive HR/salary data into the persisted cache.

**CI and review-process integrity**

- `.github/workflows/ci.yml`: the `bundle-analyzer` job holds `permissions: pull-requests: write` and
  builds with placeholder secrets. Any job that gains `write` permissions, echoes a secret, or adds a
  `pull_request_target` trigger is a finding.
- The `staging-api-block` job exists to _fail_ when the "Staging API" label is present. Removing it,
  or making it conditional, defeats a deliberate merge gate.
- Changes to `.claude/**` (commands, rules, `settings.json`, agent definitions) must not lower
  severity thresholds, strip checks, or enable plugins/marketplaces outside CruGlobal control.

---

## Mined from merged PR history

Rules derived from 50 merged PRs (#2002–#2056). Each carries the PRs it came from.

- Gate UI on a capability the API returns (`canEditCoach`, `mpdSupervisorAdmin`), not on a
  client-side inference about the viewer's role, and gate on who can already reach the page rather
  than the narrowest admin role. Name the backend authorization scope that actually enforces it.
  <!-- evidence: PR #2023, #2035, #2036, #2038 -->
- A page that renders another person's record must scope every query and mutation by the viewed
  person's id and `skip` while that id is absent — never rely on an optional argument defaulting
  server-side, and never key one query on a URL param independent of the scoping id. Verify the
  mutation's server-side scope matches the scope that produced the rows (`*AdminScoped` on a table
  fed by `*CoordinatorScoped` is a regression).
  <!-- evidence: PR #2024, #2029, #2033 -->
- A new sub-page under an already-gated route tree must carry the same guards as its sibling listing
  page: the feature kill-switch env check returning `notFound`, `blockImpersonatingNonDevelopers`,
  and the `<UserTypeAccess requireUserGroups={...}>` wrapper. A sub-page reached only by a link is
  still reachable by URL, and a test asserting `getServerSideProps === ensureSessionAndAccountList`
  locks the weaker guard in.
  <!-- evidence: PR #2019, #2025 -->
