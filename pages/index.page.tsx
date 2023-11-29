import { ReactNode } from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import BaseLayout from '../src/components/Layouts/Basic';

const IndexPage = (): ReactNode => null;

IndexPage.layout = BaseLayout;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  return {
    redirect: {
      destination: session ? '/accountLists' : '/login',
      permanent: false,
    },
  };
};

export default IndexPage;
