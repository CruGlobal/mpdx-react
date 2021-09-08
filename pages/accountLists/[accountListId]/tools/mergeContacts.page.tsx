import React from 'react';
import { useTranslation } from 'react-i18next';
import Head from 'next/head';
import MergeContacts from '../../../../src/components/Tool/MergeContacts/MergeContacts';

const MergeContacts: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>MPDX | {t('Merge Contacts')}</title>
      </Head>
      <MergeContacts />
    </>
  );
};

export default mergeContacts;
