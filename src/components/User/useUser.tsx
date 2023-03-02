import { GetUserQuery, useGetUserQuery } from './GetUser.generated';
import { getSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Session } from 'next-auth';

// Use this call to grab user data
export const useUser = (): GetUserQuery['user'] | undefined => {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    getSession().then((session) => {
      setSession(session);
    });
  }, []);

  const { data } = useGetUserQuery({
    fetchPolicy: 'cache-first',
    skip: !session,
  });
  return data?.user;
};
