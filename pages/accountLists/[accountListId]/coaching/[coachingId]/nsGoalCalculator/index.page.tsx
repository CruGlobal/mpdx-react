import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { blockImpersonation } from 'pages/api/utils/pagePropsHelpers';
import { GoalSettingsView } from 'src/components/HrTools/NsGoalCalculator/GoalSettings/GoalSettingsView';
import Loading from 'src/components/Loading';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { getAppName } from 'src/lib/getAppName';
import { ImpersonationArea } from 'src/lib/impersonationAccess';
import { getQueryParam } from 'src/lib/queryParam';

export const NsGoalCalculatorPage: React.FC = () => {
  const { t } = useTranslation();
  const appName = getAppName();
  const accountListId = useAccountListId();
  const { query } = useRouter();
  const coachingId = getQueryParam(query, 'coachingId');

  return (
    <>
      <Head>
        <title>{`${appName} | ${t('Coaching Accounts | New Staff Goal Calculator')}`}</title>
      </Head>
      {accountListId && coachingId ? (
        <GoalSettingsView
          accountListId={coachingId}
          returnUrl={`/accountLists/${accountListId}/coaching/${coachingId}`}
          returnLabel={t('Back to Coaching')}
        />
      ) : (
        <Loading loading />
      )}
    </>
  );
};

// The coached calculator shows the same data as the HR tool, so it shares its
// impersonation guard (the coaching page itself stays open to every role).
export const getServerSideProps = blockImpersonation(
  ImpersonationArea.NsGoalCalculator,
);

export default NsGoalCalculatorPage;
