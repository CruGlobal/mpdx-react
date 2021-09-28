import React from 'react';
import { useTranslation } from 'react-i18next';
import Head from 'next/head';
import MergeContacts from '../../../../src/components/Tool/MergeContacts/MergeContacts';
import { useAccountListId } from '../../../../src/hooks/useAccountListId';
import Loading from '../../../../src/components/Loading';

const MergeContactsPage: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  return (
    <>
      <Head>
        <title>MPDX | {t('Merge Contacts')}</title>
      </Head>
      {accountListId ? (
        <MergeContacts accountListId={accountListId} />
      ) : (
        <Loading loading />
      )}
    </>
  );
};

export default MergeContactsPage;
