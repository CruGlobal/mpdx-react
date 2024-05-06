import { Session } from 'next-auth';
import { useSession } from 'next-auth/react';

// This hook should only be used by components nested within a <RouterGuard>
// Since RouterGuard only renders its children when the session is available,
// this hook can assume that a session will always be available. Callers will
// not have to use optional chaining on the returned session.
export const useRequiredSession = (): Session['user'] => {
  const { data: session } = useSession();
  if (!session?.user) {
    // <RouterGuard> failed to maintain its invariant that any code nested
    // within it will have a valid session
    throw new Error('Invariant violation: session is unavailable');
  }

  return session.user;
};
