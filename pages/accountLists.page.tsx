import React, { ReactElement } from 'react';
import Head from 'next/head';
import { GetServerSideProps, GetServerSidePropsResult } from 'next';
import { getSession } from 'next-auth/react';
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
  req,
}): Promise<GetServerSidePropsResult<Props>> => {
  const session = await getSession({ req });

  const apiToken = session?.user.apiToken;

  if (!apiToken) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
  const client = await ssrClient(apiToken);
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
    return {
      redirect: {
        destination: `/accountLists/${response.data.accountLists.nodes[0]?.id}`,
        permanent: false,
      },
    };
  }

  return {
    props: { data: response.data },
  };
};

export default AccountListsPage;
