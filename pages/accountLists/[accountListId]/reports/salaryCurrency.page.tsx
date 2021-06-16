import React, { ReactElement } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { SalaryReportTable } from 'src/components/Reports/SalaryReport/SalaryReportTable';
import Loading from 'src/components/Loading';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { ReportLayout } from 'src/components/Reports/ReportLayout/ReportLayout';

const SalaryReportPage = (): ReactElement => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();

  return (
    <>
      <Head>
        <title>
          MPDX | {t('Reports')} | {t('14 Month Report (Salary)')}
        </title>
      </Head>
      {accountListId ? (
        <ReportLayout
          id="salaryCurrency"
          title="Contributions by Salary Currency"
        >
          <SalaryReportTable accountListId={accountListId} />
        </ReportLayout>
      ) : (
        <Loading loading />
      )}
    </>
  );
};

export default SalaryReportPage;
