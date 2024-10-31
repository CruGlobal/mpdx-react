import { GetServerSideProps } from 'next';
import { ReactNode } from 'react';
import { getSession } from 'next-auth/react';
import { loginRedirect } from 'pages/api/utils/pagePropsHelpers';

// This page redirect old email invite links to the new page that handles invites
const OrgInvitePage = (): ReactNode => null;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  if (!session) {
    return loginRedirect(context);
  }

  const { orgId, inviteId, code } = context.query;
  const redirectURL =
    orgId && inviteId && code
      ? `/acceptInvite?orgId=${orgId}&orgInviteId=${inviteId}&inviteCode=${code}`
      : // Intentionally redirect to invalid accountListId since we don't have the current user's accountListId
        '/accountLists/_/';
  return {
    redirect: {
      destination: redirectURL,
      permanent: true,
    },
  };
};

export default OrgInvitePage;
