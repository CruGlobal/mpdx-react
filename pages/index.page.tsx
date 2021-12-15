import React, { ReactElement } from 'react';
import { getSession } from 'next-auth/react';
import { GetServerSideProps } from 'next';
import BaseLayout from '../src/components/Layouts/Basic';

const IndexPage = (): ReactElement => <></>;

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
