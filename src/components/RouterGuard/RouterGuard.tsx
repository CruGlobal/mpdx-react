import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { DateTime } from 'luxon';
import { signIn, useSession } from 'next-auth/react';

interface Props {
  children?: React.ReactElement;
}

export const RouterGuard: React.FC<Props> = ({ children = null }) => {
  const { push } = useRouter();

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
