import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import { CoachingList } from 'src/components/Coaching/CoachingList';
import { CoachingDetail } from 'src/components/Coaching/CoachingDetail/CoachingDetail';
import { useAccountListId } from 'src/hooks/useAccountListId';
import Loading from 'src/components/Loading';

const CoachingPage: React.FC = () => {
  const { t } = useTranslation();
  const { query, push, replace, isReady, pathname } = useRouter();
  const accountListId = useAccountListId();

  const { coachingId } = query;
  const [coachingDetailId, setContactDetailId] = useState<string>();

  useEffect(() => {
    if (isReady && coachingId) {
      setContactDetailId(coachingId[0]);
    }
  }, [isReady, coachingId]);

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
      {accountListId ? (
        coachingDetailId ? (
          <CoachingDetail coachingId={coachingDetailId} />
        ) : (
          <CoachingList accountListId={accountListId} />
        )
      ) : (
        <Loading loading />
      )}
    </>
  );
};

export default CoachingPage;
