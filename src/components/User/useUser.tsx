import { GetUserQuery, useGetUserQuery } from './GetUser.generated';
import { getSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Session } from 'next-auth';

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
    fetchPolicy: 'cache-and-network',
    skip: !session,
  });
  return data?.user;
};
