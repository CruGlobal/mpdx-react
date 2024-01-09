import { useEffect, useState } from 'react';
import { Session } from 'next-auth';
import { getSession } from 'next-auth/react';
import { GetUserQuery, useGetUserQuery } from './GetUser.generated';

// Use this call to grab user data
export const useUser = (): GetUserQuery['user'] | undefined => {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    getSession()
      .then((session) => {
        setSession(session);
      })
      .catch(() => {
        // eslint-disable-next-line no-console
        console.log('Error with getSession');
      });
  }, []);

  const { data } = useGetUserQuery({
    skip: !session,
  });
  return data?.user;
};
