import React, { ReactElement } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { CoachingList } from 'src/components/Coaching/CoachingList';

const CoachesPage = (): ReactElement => {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>MPDX | {t('Coaching Accounts')}</title>
      </Head>
      <CoachingList />
    </>
  );
};

export default CoachingPage;
