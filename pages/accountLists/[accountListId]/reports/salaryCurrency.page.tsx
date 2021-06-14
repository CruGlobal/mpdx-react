import React, { ReactElement } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { Box } from '@material-ui/core';
import { SalaryReportTable } from '../../../../src/components/Reports/SalaryReport/SalaryReportTable';
import Loading from '../../../../src/components/Loading';
import { useAccountListId } from '../../../../src/hooks/useAccountListId';

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
        <Box>
          <SalaryReportTable accountListId={accountListId} />
        </Box>
      ) : (
        <Loading loading />
      )}
    </>
  );
};

export default SalaryReportPage;
