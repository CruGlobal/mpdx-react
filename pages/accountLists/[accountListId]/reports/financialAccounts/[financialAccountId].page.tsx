import Head from 'next/head';
import React, { useState } from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { loadSession } from 'pages/api/utils/pagePropsHelpers';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import Loading from 'src/components/Loading';
import { AccountSummary } from 'src/components/Reports/FinancialAccountsReport/AccountSummary/AccountSummary';
import { headerHeight } from 'src/components/Shared/Header/ListHeader';
import {
  MultiPageMenu,
  NavTypeEnum,
} from 'src/components/Shared/MultiPageLayout/MultiPageMenu/MultiPageMenu';
import { useAccountListId } from 'src/hooks/useAccountListId';
import useGetAppSettings from 'src/hooks/useGetAppSettings';

const FinancialAccountSummaryPage: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { appName } = useGetAppSettings();
  const [navListOpen, setNavListOpen] = useState(false);
  const [designationAccounts, setDesignationAccounts] = useState<string[]>([]);

  const handleNavListToggle = () => {
    setNavListOpen(!navListOpen);
  };
  return (
    <>
      <Head>
        <title>
          {appName} | {t('Summary Report - Responsibility Centers')}
        </title>
      </Head>

      {accountListId ? (
        <Box sx={{ background: 'common.white' }}>
          <SidePanelsLayout
            headerHeight={headerHeight}
            isScrollBox={false}
            leftOpen={navListOpen}
            leftWidth="290px"
            mainContent={
              <AccountSummary handleNavListToggle={handleNavListToggle} />
            }
            leftPanel={
              <MultiPageMenu
                isOpen={navListOpen}
                selectedId="financialAccounts"
                onClose={handleNavListToggle}
                designationAccounts={designationAccounts}
                setDesignationAccounts={setDesignationAccounts}
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

export const getServerSideProps = loadSession;

export default FinancialAccountSummaryPage;
