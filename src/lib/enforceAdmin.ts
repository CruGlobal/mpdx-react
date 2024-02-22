import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';

// Redirect back to the dashboard if the user isn't an admin
export const enforceAdmin: GetServerSideProps = async (context) => {
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
    props: {},
  };
};
