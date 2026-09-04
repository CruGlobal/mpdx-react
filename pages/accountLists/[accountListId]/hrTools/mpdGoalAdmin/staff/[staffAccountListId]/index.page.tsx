import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ensureSessionAndAccountList } from 'pages/api/utils/pagePropsHelpers';
import {
  MpdGoalAdminTabEnum,
  mpdGoalAdminUrl,
} from 'src/components/HrTools/MpdGoalAdmin/mpdGoalAdminHelpers';
import { GoalSettingsView } from 'src/components/HrTools/NsGoalCalculator/GoalSettings/GoalSettingsView';
import Loading from 'src/components/Loading';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { getAppName } from 'src/lib/getAppName';
import { getQueryParam } from 'src/lib/queryParam';

/** Staff Details: one training attendee's goal, opened from the admin table. */
export const NsStaffDetailsPage: React.FC = () => {
  const { t } = useTranslation();
  const appName = getAppName();
  const accountListId = useAccountListId();
  const { query } = useRouter();
  const staffAccountListId = getQueryParam(query, 'staffAccountListId');

  return (
    <>
      <Head>
        <title>{`${appName} | ${t('MPD Goal Calculator - Staff Details')}`}</title>
      </Head>
      {accountListId && staffAccountListId ? (
        <GoalSettingsView
          accountListId={staffAccountListId}
          returnUrl={mpdGoalAdminUrl(
            accountListId,
            MpdGoalAdminTabEnum.ActiveGoals,
          )}
        />
      ) : (
        <Loading loading />
      )}
    </>
  );
};

export const getServerSideProps = ensureSessionAndAccountList;

export default NsStaffDetailsPage;
