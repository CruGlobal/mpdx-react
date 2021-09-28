import React, { ReactElement } from 'react';
import Head from 'next/head';
import { GetServerSideProps, GetServerSidePropsResult } from 'next';
import { getSession } from 'next-auth/client';
import { useTranslation } from 'react-i18next';
import AccountLists from '../src/components/AccountLists';
import { ssrClient } from '../src/lib/client';
import BaseLayout from '../src/components/Layouts/Primary';
import {
  GetAccountListsDocument,
  GetAccountListsQuery,
  GetAccountListsQueryVariables,
} from './GetAccountLists.generated';

interface Props {
  data?: GetAccountListsQuery;
}

const AccountListsPage = ({ data }: Props): ReactElement => {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>MPDX | {t('Account Lists')}</title>
      </Head>
      {data && <AccountLists data={data} />}
    </>
  );
};

AccountListsPage.layout = BaseLayout;

export const getServerSideProps: GetServerSideProps = async ({
  res,
  req,
}): Promise<GetServerSidePropsResult<Props>> => {
  const session = await getSession({ req });

  const token = session?.user.token;

  if (!token) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  const client = await ssrClient(token);
  const response = await client.query<
    GetAccountListsQuery,
    GetAccountListsQueryVariables
  >({
    query: GetAccountListsDocument,
  });

  if (
    response.data.accountLists.nodes &&
    response.data.accountLists.nodes.length === 1
  ) {
    res.writeHead(302, {
      Location: `/accountLists/${response.data.accountLists.nodes[0]?.id}`,
    });
    res.end();
    return { props: {} };
  }

  return {
    props: { data: response.data },
  };
};

export default AccountListsPage;
