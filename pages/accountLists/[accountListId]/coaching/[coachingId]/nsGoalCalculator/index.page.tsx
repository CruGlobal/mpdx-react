import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ensureSessionAndAccountList } from 'pages/api/utils/pagePropsHelpers';
import { GoalSettingsView } from 'src/components/HrTools/NsGoalCalculator/GoalSettings/GoalSettingsView';
import Loading from 'src/components/Loading';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { getAppName } from 'src/lib/getAppName';
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
        <GoalSettingsView accountListId={coachingId} />
      ) : (
        <Loading loading />
      )}
    </>
  );
};

export const getServerSideProps = ensureSessionAndAccountList;

export default NsGoalCalculatorPage;
