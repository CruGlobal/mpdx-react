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
        <ReportPageWrapper>
          <MpdGoalAdminProvider>
            <MpdGoalAdminContent />
          </MpdGoalAdminProvider>
        </ReportPageWrapper>
      ) : (
        <Loading loading />
      )}
    </>
  );
};

export const getServerSideProps = blockImpersonatingNonDevelopers;

export default MpdGoalAdminPage;
