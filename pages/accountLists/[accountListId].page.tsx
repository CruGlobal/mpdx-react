import React, { ReactElement, useState, useEffect } from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import useGetAppSettings from '../../src/hooks/useGetAppSettings';
import Dashboard from '../../src/components/Dashboard';
import { ssrClient } from '../../src/lib/client';
import {
  GetDashboardDocument,
  GetDashboardQuery,
  GetDashboardQueryVariables,
} from './GetDashboard.generated';
import { renderDialog } from 'src/components/Layouts/Primary/TopBar/Items/AddMenu/AddMenu';
import useTaskModal from '../../src/hooks/useTaskModal';

interface Props {
  data: GetDashboardQuery;
  accountListId: string;
  modal: string;
}

const AccountListIdPage = ({
  data,
  accountListId,
  modal,
}: Props): ReactElement => {
  const { appName } = useGetAppSettings();
  const { openTaskModal } = useTaskModal();
  const [selectedMenuItem, changeSelectedMenuItem] = useState(-1);
  const [dialogOpen, changeDialogOpen] = useState(false);

  useEffect(() => {
    if (!modal || dialogOpen) return;
    switch (modal) {
      case 'AddContact':
        changeSelectedMenuItem(0);
        changeDialogOpen(true);
        break;
      case 'AddMultipleContacts':
        changeSelectedMenuItem(1);
        changeDialogOpen(true);
        break;
      case 'AddDonation':
        changeSelectedMenuItem(2);
        changeDialogOpen(true);
        break;
      case 'AddTask':
        openTaskModal({});
        break;
      case 'AddLogTask':
        openTaskModal({ view: 'log' });
        break;
    }
  }, [modal]);

  return (
    <>
      <Head>
        <title>
          {appName} | {data.accountList.name}
        </title>
      </Head>
      <Dashboard data={data} accountListId={accountListId} />

      {modal && renderDialog(selectedMenuItem, dialogOpen, changeDialogOpen)}
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({
  query,
  req,
}) => {
  const session = await getSession({ req });

  // If no token from session, redirect to login page
  if (!session?.user.apiToken) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  const client = await ssrClient(session?.user.apiToken);
  const response = await client.query<
    GetDashboardQuery,
    GetDashboardQueryVariables
  >({
    query: GetDashboardDocument,
    variables: {
      accountListId: query?.accountListId
        ? Array.isArray(query.accountListId)
          ? query.accountListId[0]
          : query.accountListId
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
      accountListId: query?.accountListId?.toString(),
      modal: query?.modal?.toString() ?? '',
    },
  };
};

export default AccountListIdPage;
