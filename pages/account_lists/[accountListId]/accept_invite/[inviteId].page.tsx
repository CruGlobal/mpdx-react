import { GetServerSideProps } from 'next';
import { ReactNode } from 'react';
import { getSession } from 'next-auth/react';
import BaseLayout from 'src/components/Layouts/Basic';

const InvitePage = (): ReactNode => null;

InvitePage.layout = BaseLayout;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  const { accountListId, inviteId, code } = context.query;

  const redirectURL =
    accountListId && inviteId && code
      ? `/acceptInvite?accountListId=${accountListId}&accountInviteId=${inviteId}&inviteCode=${code}`
      : `/accountLists/${accountListId}`;

  return {
    redirect: {
      destination: session ? redirectURL : '/login',
      permanent: true,
    },
    props: {
      session,
    },
  };
};

export default InvitePage;
