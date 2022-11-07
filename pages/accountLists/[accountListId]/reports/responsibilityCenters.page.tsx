import React, { useState } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import { ResponsibilityCentersReport } from 'src/components/Reports/ResponsibilityCentersReport/ResponsibilityCentersReport';
import Loading from 'src/components/Loading';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { NavReportsList } from 'src/components/Reports/NavReportsList/NavReportsList';

const ResponsibilityCentersReportPageWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
}));

const ResponsibilityCentersReportPage: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const [isNavListOpen, setNavListOpen] = useState<boolean>(false);

  const handleNavListToggle = () => {
    setNavListOpen(!isNavListOpen);
  };

  return (
    <>
      <Head>
        <title>MPDX | {t('Reports - Responsibility Centers')}</title>
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
              />
            }
            leftOpen={isNavListOpen}
            leftWidth="290px"
            mainContent={
              <ResponsibilityCentersReport
                accountListId={accountListId}
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
