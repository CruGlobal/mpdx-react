import { useRequiredSession } from './useRequiredSession';

// During a restricted MPD-leader impersonation session the API rejects all
// mutations except the ones powering the editable MPD leader tools, so the
// remaining HR tools must render read-only and never fire mutations.
export const useRestrictedImpersonation = (): boolean => {
  const { impersonationScope } = useRequiredSession();
  return !!impersonationScope;
};
