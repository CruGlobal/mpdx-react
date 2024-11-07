import { GetServerSideProps } from 'next';
import { ReactNode } from 'react';
import { getSession } from 'next-auth/react';
import BaseLayout from 'src/components/Layouts/Basic';
import { loginRedirect } from './api/utils/pagePropsHelpers';

const IndexPage = (): ReactNode => null;

IndexPage.layout = BaseLayout;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  if (!session) {
    return loginRedirect(context);
  }

  return {
    redirect: {
      destination: '/accountLists',
      permanent: false,
    },
  };
};

export default IndexPage;
