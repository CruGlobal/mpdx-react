import { GetServerSideProps } from 'next';
import { ReactNode } from 'react';
import { getSession } from 'next-auth/react';

// This page redirect old email invite links to the new page that handles invites
const OrgInvitePage = (): ReactNode => null;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  const { orgId, inviteId, code } = context.query;

  const redirectURL =
    orgId && inviteId && code
      ? `/acceptInvite?orgId=${orgId}&orgInviteId=${inviteId}&inviteCode=${code}`
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

export default OrgInvitePage;
