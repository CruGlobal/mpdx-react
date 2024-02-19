import { GetServerSideProps, GetServerSidePropsResult } from 'next';
import Head from 'next/head';
import React, { ReactElement } from 'react';
import { Session } from 'next-auth';
import { getSession } from 'next-auth/react';
import { useTranslation } from 'react-i18next';
import makeSsrClient from 'pages/api/utils/ssrClient';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import AccountLists from '../src/components/AccountLists';
import BaseLayout from '../src/components/Layouts/Primary';
import {
  GetAccountListsDocument,
  GetAccountListsQuery,
  GetAccountListsQueryVariables,
} from './GetAccountLists.generated';

export type AccountListsPageProps = {
  data?: GetAccountListsQuery;
  session: Session | null;
};

const AccountListsPage = ({ data }: AccountListsPageProps): ReactElement => {
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

export const getServerSideProps: GetServerSideProps = async (
  context,
): Promise<GetServerSidePropsResult<AccountListsPageProps>> => {
  const session = await getSession(context);
  const apiToken = session?.user?.apiToken;
  if (!apiToken) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  const ssrClient = makeSsrClient(apiToken);
  const { data } = await ssrClient.query<
    GetAccountListsQuery,
    GetAccountListsQueryVariables
  >({
    query: GetAccountListsDocument,
  });

  if (data.accountLists.nodes.length === 1) {
    return {
      redirect: {
        destination: `/accountLists/${data.accountLists.nodes[0].id}`,
        permanent: false,
      },
    };
  }

  return {
    props: {
      data,
      session,
    },
  };
};

export default AccountListsPage;
