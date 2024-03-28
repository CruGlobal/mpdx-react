import { GetServerSideProps } from 'next';
import { ReactNode } from 'react';
import { getSession } from 'next-auth/react';
import BaseLayout from 'src/components/Layouts/Basic';

const IndexPage = (): ReactNode => null;

IndexPage.layout = BaseLayout;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  return {
    redirect: {
      destination: session ? '/accountLists' : '/login',
      permanent: false,
    },
    props: {
      session,
    },
  };
};

export default IndexPage;
