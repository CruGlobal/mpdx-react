import Head from 'next/head';
import React, { ReactElement, useMemo } from 'react';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { loadSession } from 'pages/api/utils/pagePropsHelpers';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import Loading from 'src/components/Loading';
import { MainContent } from 'src/components/Reports/FinancialAccountsReport/MainContent/MainContent';
import { headerHeight } from 'src/components/Shared/Header/ListHeader';
import {
  MultiPageMenu,
  NavTypeEnum,
} from 'src/components/Shared/MultiPageLayout/MultiPageMenu/MultiPageMenu';
import { useAccountListId } from 'src/hooks/useAccountListId';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { FinancialAccountsWrapper } from './Wrapper';

const FinancialAccounts = (): ReactElement => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { appName } = useGetAppSettings();

  return (
    <>
      <Head>
        <title>
          {appName} | {t('Reports - Responsibility Centers')}
        </title>
      </Head>

      {accountListId ? (
        <Box sx={{ background: 'common.white' }}>
          <SidePanelsLayout
            headerHeight={headerHeight}
            isScrollBox={false}
            leftOpen={isNavListOpen}
            leftWidth="290px"
            mainContent={<MainContent />}
            leftPanel={
              <MultiPageMenu
                isOpen={isNavListOpen}
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

const FinancialAccountsPage: React.FC = () => (
  <FinancialAccountsWrapper>
    <FinancialAccounts />
  </FinancialAccountsWrapper>
);

export const getServerSideProps = loadSession;

export default FinancialAccountsPage;
