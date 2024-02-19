import { GetServerSideProps } from 'next';
import Head from 'next/head';
import React, { ReactElement, useEffect, useState } from 'react';
import { Session } from 'next-auth';
import { getSession } from 'next-auth/react';
import makeSsrClient from 'pages/api/utils/ssrClient';
import { renderDialog } from 'src/components/Layouts/Primary/TopBar/Items/AddMenu/AddMenu';
import { suggestArticles } from 'src/lib/helpScout';
import Dashboard from '../../src/components/Dashboard';
import useGetAppSettings from '../../src/hooks/useGetAppSettings';
import useTaskModal from '../../src/hooks/useTaskModal';
import {
  GetDashboardDocument,
  GetDashboardQuery,
  GetDashboardQueryVariables,
} from './GetDashboard.generated';

export interface AccountListIdPageProps {
  data: GetDashboardQuery;
  modal: string;
  session: Session | null;
}

const AccountListIdPage = ({
  data,
  modal,
}: AccountListIdPageProps): ReactElement => {
  const { appName } = useGetAppSettings();
  const { openTaskModal } = useTaskModal();
  const [selectedMenuItem, setSelectedMenuItem] = useState(-1);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    suggestArticles('HS_HOME_SUGGESTIONS');
  }, []);

  useEffect(() => {
    if (!modal || dialogOpen) return;
    switch (modal) {
      case 'AddContact':
        setSelectedMenuItem(0);
        setDialogOpen(true);
        break;
      case 'AddMultipleContacts':
        setSelectedMenuItem(1);
        setDialogOpen(true);
        break;
      case 'AddDonation':
        setSelectedMenuItem(2);
        setDialogOpen(true);
        break;
      case 'AddTask':
        openTaskModal({ view: 'add' });
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
      <Dashboard data={data} accountListId={data.accountList.id} />

      {modal && renderDialog(selectedMenuItem, dialogOpen, setDialogOpen)}
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  const apiToken = session?.user.apiToken;
  // If no token from session, redirect to login page
  if (!apiToken) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  try {
    const { query } = context;
    if (typeof query.accountListId !== 'string') {
      throw new Error('Invalid accountListId');
    }

    const ssrClient = makeSsrClient(apiToken);
    const { data } = await ssrClient.query<
      GetDashboardQuery,
      GetDashboardQueryVariables
    >({
      query: GetDashboardDocument,
      variables: {
        accountListId: query.accountListId,
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
        data,
        modal: query?.modal?.toString() ?? '',
        session,
      },
    };
  } catch {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }
};

export default AccountListIdPage;
