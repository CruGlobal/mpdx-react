import React, { ReactElement, useEffect } from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/client';
import { useTranslation } from 'react-i18next';
import Dashboard from '../../src/components/Dashboard';
import { ssrClient } from '../../src/lib/client';
import { useApp } from '../../src/components/App';
import {
  GetDashboardDocument,
  GetDashboardQuery,
  GetDashboardQueryVariables,
} from './GetDashboard.generated';

interface Props {
  data: GetDashboardQuery;
  accountListId: string;
}

const AccountListIdPage = ({ data, accountListId }: Props): ReactElement => {
  const { dispatch } = useApp();
  const { t } = useTranslation();

  useEffect(() => {
    dispatch({ type: 'updateBreadcrumb', breadcrumb: t('Dashboard') });
    dispatch({ type: 'updateAccountListId', accountListId });
  }, []);

  return (
    <>
      <Head>
        <title>MPDX | {data.accountList.name}</title>
      </Head>
      <Dashboard data={data} accountListId={accountListId} />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({
  params,
  req,
  res,
}) => {
  const session = await getSession({ req });

  if (!session?.user['token']) {
    res.writeHead(302, { Location: '/' });
    res.end();
    return { props: {} };
  }

  const client = await ssrClient(session?.user['token']);
  const response = await client.query<
    GetDashboardQuery,
    GetDashboardQueryVariables
  >({
    query: GetDashboardDocument,
    variables: {
      accountListId: params?.accountListId
        ? Array.isArray(params.accountListId)
          ? params.accountListId[0]
          : params.accountListId
        : '',
      // TODO: implement these variables in query
      // endOfDay: DateTime.local().endOf('day').toISO(),
      // today: DateTime.local().endOf('day').toISODate(),
      // twoWeeksFromNow: DateTime.local()
      //   .endOf('day')
      //   .plus({ weeks: 2 })
      //   .toISODate(),
    },
  });

  return {
    props: {
      data: response.data,
      accountListId: params?.accountListId?.toString(),
    },
  };
};

export default AccountListIdPage;
