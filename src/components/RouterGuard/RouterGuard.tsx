import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { DateTime } from 'luxon';
import { signIn, useSession } from 'next-auth/react';

interface Props {
  children?: React.ReactElement;
}

export const RouterGuard: React.FC<Props> = ({ children = null }) => {
  const { push, isReady } = useRouter();

  const session = useSession({
    required: true,
    onUnauthenticated: () => {
      push({ pathname: '/login', query: { redirect: window.location.href } });
    },
  });

  useEffect(() => {
    if (
      session.status === 'authenticated' &&
      DateTime.now().toISO() > session.data.expires
    ) {
      signIn('okta');
    }
  }, [session]);

  // Pages without getServerSideProps are prerendered, so their route params
  // aren't available until the router is ready
  return session.status === 'authenticated' && isReady ? (
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
