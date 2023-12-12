import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { renderDialog } from 'src/components/Layouts/Primary/TopBar/Items/AddMenu/AddMenu';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { suggestArticles } from 'src/lib/helpScout';
import Dashboard from '../../src/components/Dashboard';
import useGetAppSettings from '../../src/hooks/useGetAppSettings';
import useTaskModal from '../../src/hooks/useTaskModal';
import { useGetDashboardQuery } from './GetDashboard.generated';

const AccountListIdPage: React.FC = () => {
  const { appName } = useGetAppSettings();
  const { query, push } = useRouter();
  const accountListId = useAccountListId() || '';
  const { openTaskModal } = useTaskModal();
  const [selectedMenuItem, setSelectedMenuItem] = useState(-1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const modal = query?.modal?.toString() ?? '';
  const { data, loading, error } = useGetDashboardQuery({
    variables: {
      accountListId,
    },
  });

  if (error) {
    push('/');
  }

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
          {appName} | {data?.accountList?.name}
        </title>
      </Head>
      {!loading && data && (
        <Dashboard data={data} accountListId={accountListId} />
      )}

      {modal && renderDialog(selectedMenuItem, dialogOpen, setDialogOpen)}
    </>
  );
};

export default AccountListIdPage;
