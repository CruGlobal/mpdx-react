import React from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import { CoachingList } from 'src/components/Coaching/CoachingList';
import { useAccountListId } from 'src/hooks/useAccountListId';

const CoachingPage: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { query, push, replace, isReady, pathname } = useRouter();

  return (
    <>
      <Head>
        <title>MPDX | {t('Coaching Accounts')}</title>
        {console.log(query)}
        {console.log(push)}
        {console.log(replace)}
        {console.log(isReady)}
        {console.log(pathname)}
      </Head>
      <CoachingList accountList={accountListId} />
    </>
  );
};

export default CoachingPage;
