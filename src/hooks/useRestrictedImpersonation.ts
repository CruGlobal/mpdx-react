import { isRestrictedImpersonation } from 'src/lib/restrictedImpersonation';
import { useRequiredSession } from './useRequiredSession';

// During a restricted MPD-leader impersonation session the API rejects all
// mutations except the ones powering the editable MPD leader tools, so the
// remaining HR tools must render read-only and never fire mutations.
// Shares its definition of "restricted" with the server-side page guards via
// isRestrictedImpersonation — see the access matrix documented there.
export const useRestrictedImpersonation = (): boolean => {
  const user = useRequiredSession();
  return isRestrictedImpersonation(user);
};
