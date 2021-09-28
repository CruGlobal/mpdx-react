import React, { useEffect, useState } from 'react';
import { getSession, signin } from 'next-auth/client';
import { useRouter } from 'next/router';
import { DateTime } from 'luxon';

export const RouterGuard: React.FC = ({ children }) => {
  const [isAuthed, setIsAuthed] = useState(false);
  const { push, pathname, query, isReady } = useRouter();
  const getSess = async () => {
    const session = await getSession();

    setIsAuthed(!!session);
    // If they do not have a valid session and they're not on the login page, navigate them to it
    if (!session && pathname !== '/login') {
      push('/login');
    }
    // Check if the session has a user
    if (session?.user) {
      // If the session is expired, sign them in again to fresh token
      // TODO eventually will have to accomidate for okta, google signin, etc
      if (DateTime.now().toISO() > session?.expires) {
        signin('thekey');
      }
    }
  };

  useEffect(() => {
    getSess();
  }, [pathname, query]);

  return (
    <>{(isReady && isAuthed) || pathname === '/login' ? children : null}</>
  );
};
