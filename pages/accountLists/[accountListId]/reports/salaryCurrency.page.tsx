import React, { useState } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { Box, styled } from '@material-ui/core';
import { SalaryReportTable } from 'src/components/Reports/FourteenMonthReports/SalaryReport/SalaryReportTable';
import Loading from 'src/components/Loading';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { NavReportsList } from 'src/components/Reports/NavReportsList/NavReportsList';

const SalaryCurrencyReportPageWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
}));

const SalaryCurrencyReportPage: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const [isNavListOpen, setNavListOpen] = useState<boolean>(false);

  const handleNavListToggle = () => {
    setNavListOpen(!isNavListOpen);
  };

  return (
    <>
      <Head>
        <title>MPDX | {t('MPDX | Reports - Salary')}</title>
      </Head>
      {accountListId ? (
        <SalaryCurrencyReportPageWrapper>
          <SidePanelsLayout
            leftPanel={
              <NavReportsList
                isOpen={isNavListOpen}
                selectedId="salaryCurrency"
                onClose={handleNavListToggle}
              />
            }
            leftOpen={isNavListOpen}
            leftWidth="290px"
            mainContent={
              <SalaryReportTable
                accountListId={accountListId}
                isNavListOpen={isNavListOpen}
                onNavListToggle={handleNavListToggle}
                title={t('Contributions by Salary Currency')}
              />
            }
          />
        </SalaryCurrencyReportPageWrapper>
      ) : (
        <Loading loading />
      )}
    </>
  );
};

export default SalaryCurrencyReportPage;
