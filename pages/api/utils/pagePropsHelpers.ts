import { GetServerSideProps } from 'next';
import { Session } from 'next-auth';
import { getSession } from 'next-auth/react';

interface PagePropsWithSession {
  session: Session;
}

// Redirect back to the dashboard if the user isn't an admin
export const enforceAdmin: GetServerSideProps<PagePropsWithSession> = async (
  context,
) => {
  const session = await getSession(context);
  if (!session?.user.admin) {
    return {
      redirect: {
        destination: `/accountLists/${context.query.accountListId ?? ''}`,
        permanent: false,
      },
    };
  }
  return {
    props: {
      session,
    },
  };
};

// Redirect back to login screen if user isn't logged in
export const loadSession: GetServerSideProps<PagePropsWithSession> = async (
  context,
) => {
  const session = await getSession(context);
  if (!session?.user.apiToken) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
  return {
    props: {
      session,
    },
  };
};
