import React, { ReactElement } from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/client';
import Dashboard from '../../src/components/Dashboard';
import { ssrClient } from '../../src/lib/client';
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
