import { useCallback } from 'react';
import {
  ImpersonationArea,
  ImpersonatorRole,
  canAccessWhileImpersonating,
} from 'src/lib/impersonationAccess';
import { useRequiredSession } from './useRequiredSession';

/**
 * The impersonator's role from the session, and whether an area is blocked
 * for them while impersonating. `blocked` is always false when not
 * impersonating; `session.developer`/`admin` describe the impersonated user,
 * so they must not be used to decide this.
 */
export const useImpersonatorRole = (): {
  impersonating: boolean;
  impersonatorRole: ImpersonatorRole | undefined;
  blocked: (area: ImpersonationArea) => boolean;
} => {
  const { impersonating, impersonatorRole } = useRequiredSession();

  const blocked = useCallback(
    (area: ImpersonationArea) =>
      !!impersonating && !canAccessWhileImpersonating(impersonatorRole, area),
    [impersonating, impersonatorRole],
  );

  return { impersonating: !!impersonating, impersonatorRole, blocked };
};
