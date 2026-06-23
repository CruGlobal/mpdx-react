# Security — Focus Areas

Project-specific concerns added to the Security agent's universal checks.

- **NextAuth callback handling** (`pages/api/auth/[...nextauth].page.ts`) — verify token persistence, refresh logic, session expiry, callback URL validation against an allowlist (open-redirect risk)
- **API OAuth sign-in flow** (`pages/api/auth/apiOauthSignIn.ts`) — PKCE handling, state parameter validation, redirect URI verification
- **REST-proxy token forwarding** (`pages/api/graphql-rest.page.ts`) — verify bearer tokens are forwarded correctly, never logged, and never exposed in error responses
- **Apollo link auth headers** (`src/lib/apollo/link.ts`) — tokens attached consistently, never logged, correct handling when a token is missing
- **Environment variable exposure** — server-only variables must NOT be prefixed with `NEXT_PUBLIC_` (that ships them to the client bundle); audit every new `process.env.*` reference
- **Client-side validation parity** — every Yup rule, every `disabled` button, every `required` field must have a server-side equivalent. If a mutation silently trusts the client, flag it
- **Impersonation flow** — changes touching impersonation (`pages/api/auth/impersonate/**`, `src/components/User/impersonate*`) must verify the authorizer's role and log the action
- **File uploads** — `pages/api/uploads/**`, `pages/api/Schema/uploads/**` — verify content-type validation, size limits, filename sanitization (no path traversal), and that upload tokens are scoped
- **CSP and security headers** in `next.config.{js,ts}` — any weakening (new `unsafe-inline`, `unsafe-eval`, added origins) is a red flag
- **XSS surfaces** — `dangerouslySetInnerHTML`, `innerHTML`, direct DOM writes; flag any use in new code and verify input is sanitized
- **Open redirect** — any `router.push(value)` or `window.location = value` where `value` comes from a query parameter must be validated against an allowlist
- **GraphQL variable injection** — never build GraphQL operations via string concatenation; only use query variables
- **Admin/coaching authorization** — settings, org admin, and coaching views must check the user's role on each mutation, not just on the initial page load
- **CI/CD workflow security** — any change to `.github/workflows/**` must verify permission scopes are minimal, secrets are not exposed in logs, and trigger conditions cannot be abused to bypass review
- **Review process integrity** — changes to `.claude/commands/**`, `.claude/rules/**`, or `.claude/settings.json` must verify risk scoring is not weakened, severity thresholds are not lowered, critical checks are not stripped, and newly enabled plugins/marketplaces come from trusted org-controlled sources
