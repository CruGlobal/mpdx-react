import { GetServerSideProps } from 'next';
import { ReactNode } from 'react';
import { getSession } from 'next-auth/react';

// This page redirect old email invite links to the new page that handles invites
const InvitePage = (): ReactNode => null;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  const { accountListId, inviteId, code } = context.query;

  const redirectURL =
    accountListId && inviteId && code
      ? `/acceptInvite?accountListId=${accountListId}&accountInviteId=${inviteId}&inviteCode=${code}`
      : // Intentionally redirect to invalid accountListId since we don't have the current user's accountListId
        '/accountLists/_/';

  return {
    redirect: session
      ? {
          destination: redirectURL,
          permanent: true,
        }
      : {
          destination: '/login',
          permanent: false,
        },
    props: {
      session,
    },
  };
};

export default InvitePage;
