import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ensureSessionAndAccountList } from 'pages/api/utils/pagePropsHelpers';
import { GoalSettingsForm } from 'src/components/HrTools/NsGoalCalculator/GoalSettings/GoalSettingsForm';
import Loading from 'src/components/Loading';
import { getAppName } from 'src/lib/getAppName';
import { getQueryParam } from 'src/lib/queryParam';

export const NsScenarioGoalPage: React.FC = () => {
  const { t } = useTranslation();
  const appName = getAppName();
  const { query } = useRouter();
  const scenarioGoalId = getQueryParam(query, 'scenarioGoalId');

  return (
    <>
      <Head>
        <title>{`${appName} | ${t('New Staff Goal Calculator')}`}</title>
      </Head>
      {scenarioGoalId ? (
        <GoalSettingsForm scenarioGoalId={scenarioGoalId} />
      ) : (
        <Loading loading />
      )}
    </>
  );
};

export const getServerSideProps = ensureSessionAndAccountList;

export default NsScenarioGoalPage;
