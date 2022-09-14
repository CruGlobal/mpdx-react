import React, { useEffect, useState } from 'react';
import { getSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import { DateTime } from 'luxon';
import { Box, CircularProgress } from '@mui/material';

interface Props {
  children?: React.ReactNode;
}

export const RouterGuard: React.FC<Props> = ({ children }) => {
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
        signIn('okta');
      }
    }
  };

  useEffect(() => {
    getSess();
  }, [pathname, query]);

  return (
    <>
      {(isReady && isAuthed) || pathname === '/login' ? (
        children
      ) : (
        <Box
          height="100vh"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <CircularProgress size={100} data-testid="LoadingIndicator" />
        </Box>
      )}
    </>
  );
};
