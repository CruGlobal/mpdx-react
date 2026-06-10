import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { DateTime } from 'luxon';
import { signIn, useSession } from 'next-auth/react';
import { useIsOnline } from 'src/hooks/useIsOnline';

interface Props {
  children?: React.ReactElement;
}

export const RouterGuard: React.FC<Props> = ({ children = null }) => {
  const { push } = useRouter();
  const isOnline = useIsOnline();

  const session = useSession({
    required: true,
    onUnauthenticated: () => {
      push({ pathname: '/login', query: { redirect: window.location.href } });
    },
  });

  useEffect(() => {
    if (
      // While offline, let an expired session keep rendering cached data;
      // the redirect to Okta would fail anyway. Re-checks on reconnect
      // because isOnline is a dependency.
      isOnline &&
      session.status === 'authenticated' &&
      DateTime.now().toISO() > session.data.expires
    ) {
      signIn('okta');
    }
  }, [session, isOnline]);

  return session.status === 'authenticated' ? (
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
  );
};
