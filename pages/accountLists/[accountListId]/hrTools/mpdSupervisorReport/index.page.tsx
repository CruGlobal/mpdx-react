import Head from 'next/head';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { blockImpersonatingNonDevelopers } from 'pages/api/utils/pagePropsHelpers';
// The filter panel renders immediately on load (it defaults to open), so it
// must not be lazy-loaded — a dynamic import shows a spinner on the client
// while the server renders the real panel, causing a hydration mismatch.
import { MpdSupervisorReportFilterPanel } from 'src/components/HrTools/MpdSupervisorReport/Filters/MpdSupervisorReportFilterPanel';
import { MpdSupervisorReport } from 'src/components/HrTools/MpdSupervisorReport/MpdSupervisorReport';
import {
  MpdSupervisorReportProvider,
  Panel,
  useMpdSupervisorReport,
} from 'src/components/HrTools/MpdSupervisorReport/MpdSupervisorReportContext';
import { StaffMemberDrawer } from 'src/components/HrTools/MpdSupervisorReport/StaffMemberDrawer/StaffMemberDrawer';
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

const MpdSupervisorReportContent: React.FC = () => {
  const { t } = useTranslation();
  const { isOpen } = useMpdSupervisorReport();
  const [panelOpen, setPanelOpen] = useState<Panel | null>(Panel.Filters);

  const handleNavListToggle = () => {
    setPanelOpen(panelOpen === Panel.Navigation ? null : Panel.Navigation);
  };

  const handleFilterListToggle = () => {
    setPanelOpen(panelOpen === Panel.Filters ? null : Panel.Filters);
  };

  return (
    <SidePanelsLayout
      isScrollBox={false}
      leftPanel={
        panelOpen === Panel.Navigation ? (
          <MultiPageMenu
            isOpen
            selectedId="mpdSupervisorReport"
            onClose={() => setPanelOpen(null)}
            navType={NavTypeEnum.HrTools}
          />
        ) : panelOpen === Panel.Filters ? (
          <MpdSupervisorReportFilterPanel onClose={() => setPanelOpen(null)} />
        ) : undefined
      }
      leftOpen={panelOpen !== null}
      leftWidth="290px"
      rightPanel={<StaffMemberDrawer />}
      rightOpen={isOpen}
      rightWidth="60%"
      headerHeight={multiPageHeaderHeight}
      mainContent={
        <MpdSupervisorReport
          panelOpen={panelOpen}
          onNavListToggle={handleNavListToggle}
          onFilterListToggle={handleFilterListToggle}
          title={t('MPD Supervisor Report')}
        />
      }
    />
  );
};

export const MpdSupervisorReportPage: React.FC = () => {
  const { t } = useTranslation();
  const appName = getAppName();
  const accountListId = useAccountListId();

  return (
    <>
      <Head>
        <title>{`${appName} | ${t('HR Tools | MPD Supervisor Report')}`}</title>
      </Head>
      {accountListId ? (
        <ReportPageWrapper>
          <MpdSupervisorReportProvider>
            <MpdSupervisorReportContent />
          </MpdSupervisorReportProvider>
        </ReportPageWrapper>
      ) : (
        <Loading loading />
      )}
    </>
  );
};

export const getServerSideProps = blockImpersonatingNonDevelopers;

export default MpdSupervisorReportPage;
