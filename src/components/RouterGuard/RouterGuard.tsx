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

  // cru-terraform#11223 (merged 2026-07-10T18:42:16Z) added Okta profile
  // claims. Sessions that authenticated before the merge must reauthenticate to
  // receive them and fix partner reminders. Remove this effect after 2026-08-10,
  // once every pre-merge token has expired on its own and this check can no longer match.
  useEffect(() => {
    if (session.status !== 'authenticated') {
      return;
    }
    // Ignore short-lived impersonation tokens
    if (session.data.user.impersonating) {
      return;
    }
    const reauthCutoff = DateTime.fromISO('2026-08-10T00:00:00Z').toSeconds();
    let apiTokenExp: number | null = null;
    try {
      const payload = session.data.user.apiToken.split('.')[1];
      apiTokenExp = JSON.parse(
        atob(payload.replace(/-/g, '+').replace(/_/g, '/')),
      ).exp;
    } catch {
      // Ignore malformed JWTs
    }

    if (typeof apiTokenExp === 'number' && apiTokenExp < reauthCutoff) {
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
