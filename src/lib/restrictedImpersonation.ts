import { Session } from 'next-auth';

/**
 * The impersonation scope values the API currently mints. As of now the only
 * value produced by the impersonation handoff is 'mpd_leader' (see
 * pages/api/auth/impersonate/impersonateHelper.ts, which reads
 * `impersonation_scope` from the API response). The session field itself is
 * typed as `string` in pages/api/auth/[...nextauth].page.ts because the value
 * arrives from a signed cookie minted by the API, but any code that needs to
 * branch on a specific scope should compare against this union so that new
 * scope values are added here deliberately.
 */
export type ImpersonationScope = 'mpd_leader';

/**
 * The scope minted when an MPD leader impersonates one of the staff they
 * supervise — currently the only `ImpersonationScope` value. Compare against
 * this constant (rather than a string literal) so the wire value stays pinned
 * to the union at compile time.
 */
export const MPD_LEADER_SCOPE: ImpersonationScope = 'mpd_leader';

/**
 * Returns whether the session is a restricted-scope impersonation session
 * (e.g. an MPD leader impersonating one of the staff they supervise).
 *
 * Access matrix when this returns true:
 * - Contacts, Tasks, and Tools sections are BLOCKED —
 *   `blockRestrictedImpersonation` in pages/api/utils/pagePropsHelpers.ts
 *   redirects away from them.
 * - HR tools / staff-expense pages are ALLOWED, rendered read-only —
 *   `blockImpersonatingNonDevelopers` lets the session through, and the API
 *   rejects all mutations except the ones powering the editable MPD leader
 *   tools (see useRestrictedImpersonation).
 *
 * Note that ANY truthy scope is treated as restricted: today that is safe
 * because 'mpd_leader' is the only scope the API mints, but a future scope
 * value would silently inherit this exact access matrix. Before introducing a
 * new scope, add it to `ImpersonationScope` and revisit whether this
 * all-scopes predicate needs to become per-scope.
 */
export const isRestrictedImpersonation = (
  user: Pick<Session['user'], 'impersonationScope'>,
): boolean => !!user.impersonationScope;
