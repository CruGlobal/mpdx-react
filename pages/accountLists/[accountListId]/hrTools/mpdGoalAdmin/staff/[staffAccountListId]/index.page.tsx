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

/**
 * Staff Details: one training attendee's goal, opened from the admin table.
 * Gated like that table, since it reaches another household's salary and debt.
 */
export const NsStaffDetailsPage: React.FC = () => {
  const { t } = useTranslation();
  const appName = getAppName();
  const accountListId = useAccountListId();
  const { query } = useRouter();
  const staffAccountListId = getQueryParam(query, 'staffAccountListId');
  // Carried through so Back to Table reselects the cohort this goal came from.
  const cohortId = getQueryParam(query, 'cohortId');

  return (
    <>
      <Head>
        <title>{`${appName} | ${t(
          'HR Tools | MPD Goal Calculator | Staff Details',
        )}`}</title>
      </Head>
      {staffAccountListId ? (
        <UserTypeAccess requireUserGroups={RequiredUserGroupEnum.MpdGoalCalc}>
          <GoalSettingsView
            accountListId={staffAccountListId}
            returnUrl={mpdGoalAdminUrl(
              accountListId,
              MpdGoalAdminTabEnum.ActiveGoals,
              cohortId,
            )}
          />
        </UserTypeAccess>
      ) : (
        <Loading loading />
      )}
    </>
  );
};

// Matches the admin table that links here: the same flag hides this page, so
// the work in progress is never reachable by URL alone.
export const getServerSideProps: GetServerSideProps = async (context) => {
  if (process.env.DISABLE_MPD_GOAL_ADMIN === 'true') {
    return { notFound: true };
  }
  return blockImpersonatingNonDevelopers(context);
};

export default NsStaffDetailsPage;
