import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import { CoachingList } from 'src/components/Coaching/CoachingList';
import { CoachingDetail } from 'src/components/Coaching/CoachingDetail/CoachingDetail';

const CoachingPage: React.FC = () => {
  const { t } = useTranslation();
  const { query, push, replace, isReady, pathname } = useRouter();

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
      {coachingDetailId ? (
        <CoachingDetail coachingId={coachingDetailId} />
      ) : (
        <CoachingList />
      )}
    </>
  );
};

export default CoachingPage;
