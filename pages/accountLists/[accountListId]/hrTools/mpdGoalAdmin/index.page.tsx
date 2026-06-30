import { GetServerSideProps } from 'next';
import Head from 'next/head';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { blockImpersonatingNonDevelopers } from 'pages/api/utils/pagePropsHelpers';
import { MpdGoalAdmin } from 'src/components/HrTools/MpdGoalAdmin/MpdGoalAdmin';
import {
  MpdGoalAdminProvider,
  useMpdGoalAdmin,
} from 'src/components/HrTools/MpdGoalAdmin/MpdGoalAdminContext';
import { StaffDetailDrawer } from 'src/components/HrTools/MpdGoalAdmin/StaffDetailDrawer/StaffDetailDrawer';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import Loading from 'src/components/Loading';
import { multiPageHeaderHeight } from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import {
  MultiPageMenu,
  NavTypeEnum,
} from 'src/components/Shared/MultiPageLayout/MultiPageMenu/MultiPageMenu';
import {
  RequiredUserGroupEnum,
  UserTypeAccess,
} from 'src/components/Shared/UserTypeAccess/UserTypeAccess';
import { ReportPageWrapper } from 'src/components/Shared/styledComponents/ReportPageWrapper';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { getAppName } from 'src/lib/getAppName';

const MpdGoalAdminContent: React.FC = () => {
  const [navListOpen, setNavListOpen] = useState(false);
  const { isDrawerOpen } = useMpdGoalAdmin();

  return (
    <SidePanelsLayout
      isScrollBox={false}
      leftPanel={
        navListOpen ? (
          <MultiPageMenu
            isOpen
            selectedId="mpdGoalAdmin"
            onClose={() => setNavListOpen(false)}
            navType={NavTypeEnum.HrTools}
          />
        ) : undefined
      }
      leftOpen={navListOpen}
      leftWidth="290px"
      rightPanel={<StaffDetailDrawer />}
      rightOpen={isDrawerOpen}
      rightWidth="60%"
      headerHeight={multiPageHeaderHeight}
      mainContent={
        <MpdGoalAdmin
          navListOpen={navListOpen}
          onNavListToggle={() => setNavListOpen((open) => !open)}
        />
      }
    />
  );
};

export const MpdGoalAdminPage: React.FC = () => {
  const { t } = useTranslation();
  const appName = getAppName();
  const accountListId = useAccountListId();

  return (
    <>
      <Head>
        <title>{`${appName} | ${t(
          'HR Tools | MPD Goal Calculator Admin Table',
        )}`}</title>
      </Head>
      {accountListId ? (
        <UserTypeAccess requireUserGroups={RequiredUserGroupEnum.MpdGoalCalc}>
          <ReportPageWrapper>
            <MpdGoalAdminProvider>
              <MpdGoalAdminContent />
            </MpdGoalAdminProvider>
          </ReportPageWrapper>
        </UserTypeAccess>
      ) : (
        <Loading loading />
      )}
    </>
  );
};

// Hide the work-in-progress admin table entirely (404) when the feature flag is
// set, otherwise fall back to the standard impersonation guard.
export const getServerSideProps: GetServerSideProps = async (context) => {
  if (process.env.DISABLE_MPD_GOAL_ADMIN === 'true') {
    return { notFound: true };
  }
  return blockImpersonatingNonDevelopers(context);
};

export default MpdGoalAdminPage;
