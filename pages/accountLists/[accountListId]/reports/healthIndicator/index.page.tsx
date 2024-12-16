import Head from 'next/head';
import React, { useState } from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ensureSessionAndAccountList } from 'pages/api/utils/pagePropsHelpers';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import Loading from 'src/components/Loading';
import { HealthIndicatorReport } from 'src/components/Reports/HealthIndicatorReport/HealthIndicatorReport';
import { headerHeight } from 'src/components/Shared/Header/ListHeader';
import {
  MultiPageMenu,
  NavTypeEnum,
} from 'src/components/Shared/MultiPageLayout/MultiPageMenu/MultiPageMenu';
import { useAccountListId } from 'src/hooks/useAccountListId';
import useGetAppSettings from 'src/hooks/useGetAppSettings';

const HealthIndicatorPage: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { appName } = useGetAppSettings();
  const [navListOpen, setNavListOpen] = useState(false);

  const handleNavListToggle = () => {
    setNavListOpen(!navListOpen);
  };
  return (
    <>
      <Head>
        <title>{`${appName} | ${t('Reports - MPD Health')}`}</title>
      </Head>

      {accountListId ? (
        <Box sx={{ background: 'common.white' }}>
          <SidePanelsLayout
            headerHeight={headerHeight}
            isScrollBox={false}
            leftOpen={navListOpen}
            leftWidth="290px"
            mainContent={
              <HealthIndicatorReport
                accountListId={accountListId}
                isNavListOpen={navListOpen}
                onNavListToggle={handleNavListToggle}
                title={t('Overall Staff MPD Health')}
              />
            }
            leftPanel={
              <MultiPageMenu
                isOpen={navListOpen}
                selectedId="healthIndicator"
                onClose={handleNavListToggle}
                navType={NavTypeEnum.Reports}
              />
            }
          />
        </Box>
      ) : (
        <Loading loading />
      )}
    </>
  );
};

export const getServerSideProps = ensureSessionAndAccountList;

export default HealthIndicatorPage;
