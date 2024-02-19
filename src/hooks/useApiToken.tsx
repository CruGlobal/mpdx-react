import { useSession } from 'next-auth/react';

// Use this call to grab user data
export const useApiToken = (): string => {
  const session = useSession();
  if (session.status !== 'authenticated') {
    // <RouterGuard> will prevent this branch from being because it renders a loading spinner instead of content when
    // session.status !== 'authenticated'
    throw new Error('User is not authenticated!');
  }
  return session.data.user.apiToken;
};
