import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import { ResponsibilityCentersReport } from 'src/components/Reports/ResponsibilityCentersReport/ResponsibilityCentersReport';
import Loading from 'src/components/Loading';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import { useAccountListId } from 'src/hooks/useAccountListId';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { NavReportsList } from 'src/components/Reports/NavReportsList/NavReportsList';
import { suggestArticles } from 'src/lib/helpScout';

const ResponsibilityCentersReportPageWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
}));

const ResponsibilityCentersReportPage: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { appName } = useGetAppSettings();
  const [isNavListOpen, setNavListOpen] = useState<boolean>(false);
  const [designationAccounts, setDesignationAccounts] = useState<string[]>([]);

  useEffect(() => {
    suggestArticles('HS_REPORTS_SUGGESTIONS');
  }, []);

  const handleNavListToggle = () => {
    setNavListOpen(!isNavListOpen);
  };

  return (
    <>
      <Head>
        <title>
          {appName} | {t('Reports - Responsibility Centers')}
        </title>
      </Head>
      {accountListId ? (
        <ResponsibilityCentersReportPageWrapper>
          <SidePanelsLayout
            isScrollBox={false}
            leftPanel={
              <NavReportsList
                isOpen={isNavListOpen}
                selectedId="responsibilityCenters"
                onClose={handleNavListToggle}
                designationAccounts={designationAccounts}
                setDesignationAccounts={setDesignationAccounts}
              />
            }
            leftOpen={isNavListOpen}
            leftWidth="290px"
            mainContent={
              <ResponsibilityCentersReport
                accountListId={accountListId}
                designationAccounts={designationAccounts}
                isNavListOpen={isNavListOpen}
                onNavListToggle={handleNavListToggle}
                title={t('Responsibility Centers')}
              />
            }
          />
        </ResponsibilityCentersReportPageWrapper>
      ) : (
        <Loading loading />
      )}
    </>
  );
};

export default ResponsibilityCentersReportPage;
