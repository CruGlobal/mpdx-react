import { GetUserQuery, useGetUserQuery } from './GetUser.generated';
import { getSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Session } from 'next-auth';

// Use this call to grab user data
export const useUser = (): GetUserQuery['user'] | undefined => {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const session = await getSession();
        setSession(session);
      } catch {}
    })();
  }, []);

  const { data } = useGetUserQuery({
    fetchPolicy: 'cache-first',
    skip: !session,
  });
  return data?.user;
};
