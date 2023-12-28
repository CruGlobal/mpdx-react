import { GetServerSideProps, GetServerSidePropsResult } from 'next';
import Head from 'next/head';
import React, { ReactElement } from 'react';
import { getToken } from 'next-auth/jwt';
import { useTranslation } from 'react-i18next';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import AccountLists from '../src/components/AccountLists';
import BaseLayout from '../src/components/Layouts/Primary';
import { ssrClient } from '../src/lib/client';
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
  const { appName } = useGetAppSettings();

  return (
    <>
      <Head>
        <title>
          {appName} | {t('Account Lists')}
        </title>
      </Head>
      {data && <AccountLists data={data} />}
    </>
  );
};

AccountListsPage.layout = BaseLayout;

export const getServerSideProps: GetServerSideProps = async ({
  req,
}): Promise<GetServerSidePropsResult<Props>> => {
  const jwtToken = (await getToken({
    req,
    secret: process.env.JWT_SECRET as string,
  })) as { apiToken: string } | null;

  const apiToken = jwtToken?.apiToken;

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
