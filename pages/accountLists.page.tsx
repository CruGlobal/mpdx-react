import Head from 'next/head';
import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { logErrorOnRollbar } from 'pages/api/utils/rollBar';
import AccountLists from 'src/components/AccountLists';
import BaseLayout from 'src/components/Layouts/Primary';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import makeSsrClient from 'src/lib/apollo/ssrClient';
import {
  GetAccountListsDocument,
  GetAccountListsQuery,
  GetAccountListsQueryVariables,
} from './GetAccountLists.generated';
import { makeGetServerSideProps } from './api/utils/pagePropsHelpers';

export interface AccountListsPageProps {
  data: GetAccountListsQuery;
}

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
      <AccountLists data={data} />
    </>
  );
};

AccountListsPage.layout = BaseLayout;

export const getServerSideProps = makeGetServerSideProps(async (session) => {
  try {
    const ssrClient = makeSsrClient(session.user.apiToken);
    const { data } = await ssrClient.query<
      GetAccountListsQuery,
      GetAccountListsQueryVariables
    >({
      query: GetAccountListsDocument,
    });

    if (data.user.setup) {
      // The user has not finished setting up, so start them on the tour
      return {
        redirect: {
          destination: '/setup/start',
          permanent: false,
        },
      };
    }

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
      },
    };
  } catch (error) {
    logErrorOnRollbar(error, '/accountLists.page');
    throw error;
  }
});

export default AccountListsPage;
