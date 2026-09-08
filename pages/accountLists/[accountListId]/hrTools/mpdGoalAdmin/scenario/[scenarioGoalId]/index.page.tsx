import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { blockImpersonatingNonDevelopers } from 'pages/api/utils/pagePropsHelpers';
import {
  MpdGoalAdminTabEnum,
  mpdGoalAdminUrl,
} from 'src/components/HrTools/MpdGoalAdmin/mpdGoalAdminHelpers';
import { GoalSettingsView } from 'src/components/HrTools/NsGoalCalculator/GoalSettings/GoalSettingsView';
import Loading from 'src/components/Loading';
import {
  RequiredUserGroupEnum,
  UserTypeAccess,
} from 'src/components/Shared/UserTypeAccess/UserTypeAccess';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { getAppName } from 'src/lib/getAppName';
import { getQueryParam } from 'src/lib/queryParam';

/** Gated like the admin table it is reached from; scenario goals are admin-built. */
export const NsScenarioGoalPage: React.FC = () => {
  const { t } = useTranslation();
  const appName = getAppName();
  const accountListId = useAccountListId();
  const { query } = useRouter();
  const scenarioGoalId = getQueryParam(query, 'scenarioGoalId');

  return (
    <>
      <Head>
        <title>{`${appName} | ${t('New Staff Goal Calculator')}`}</title>
      </Head>
      {scenarioGoalId ? (
        <UserTypeAccess requireUserGroups={RequiredUserGroupEnum.MpdGoalCalc}>
          <GoalSettingsView
            scenarioGoalId={scenarioGoalId}
            returnUrl={mpdGoalAdminUrl(
              accountListId,
              MpdGoalAdminTabEnum.ScenarioGoals,
            )}
          />
        </UserTypeAccess>
      ) : (
        <Loading loading />
      )}
    </>
  );
};

// Matches the admin table this is reached from: the same flag hides this page,
// so the work in progress is never reachable by URL alone.
export const getServerSideProps: GetServerSideProps = async (context) => {
  if (process.env.DISABLE_MPD_GOAL_ADMIN === 'true') {
    return { notFound: true };
  }
  return blockImpersonatingNonDevelopers(context);
};

export default NsScenarioGoalPage;
