import React, { ReactElement, useEffect, useState } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { ExpectedMonthlyTotalReportHeader } from '../../../../src/components/Reports/ExpectedMonthlyTotalReport/Header/ExpectedMonthlyTotalReportHeader';
import Loading from '../../../../src/components/Loading';
import { useAccountListId } from '../../../../src/hooks/useAccountListId';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { ExpectedMonthlyTotalReport } from '../../../../src/components/Reports/ExpectedMonthlyTotalReport/ExpectedMonthlyTotalReport';
import { suggestArticles } from 'src/lib/helpScout';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import {
  MultiPageMenu,
  NavTypeEnum,
} from 'src/components/Shared/MultiPageLayout/MultiPageMenu/MultiPageMenu';

const ExpectedMonthlyTotalReportPageWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
}));

const ExpectedMonthlyTotalReportPage = (): ReactElement => {
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
          {appName} | {t('Reports')} | {t('Expect Monthly Total')}
        </title>
      </Head>
      {accountListId ? (
        <ExpectedMonthlyTotalReportPageWrapper>
          <SidePanelsLayout
            isScrollBox={false}
            leftPanel={
              <MultiPageMenu
                isOpen={isNavListOpen}
                selectedId="expectedMonthlyTotal"
                onClose={handleNavListToggle}
                designationAccounts={designationAccounts}
                setDesignationAccounts={setDesignationAccounts}
                navType={NavTypeEnum.Reports}
              />
            }
            leftOpen={isNavListOpen}
            leftWidth="290px"
            mainContent={
              <ExpectedMonthlyTotalReport
                accountListId={accountListId}
                designationAccounts={designationAccounts}
                isNavListOpen={isNavListOpen}
                onNavListToggle={handleNavListToggle}
                title={t('Expected Monthly Total')}
              />
            }
          />
        </ExpectedMonthlyTotalReportPageWrapper>
      ) : (
        <>
          <ExpectedMonthlyTotalReportHeader
            empty={true}
            totalDonations={0}
            totalLikely={0}
            totalUnlikely={0}
            total={0}
            currency={''}
          />
          <Loading loading />
        </>
      )}
    </>
  );
};

export default ExpectedMonthlyTotalReportPage;
