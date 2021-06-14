import React, { ReactElement } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import { Box } from '@material-ui/core';
import { SalaryReportTable } from '../../../../src/components/Reports/SalaryReport/SalaryReportTable';
import Loading from '../../../../src/components/Loading';

const SalaryReportPage = (): ReactElement => {
  const { t } = useTranslation();
  const { query, isReady } = useRouter();

  const { accountListId } = query;

  if (Array.isArray(accountListId)) {
    throw new Error('accountListId should not be an array');
  }

  return (
    <>
      <Head>
        <title>
          MPDX | {t('Reports')} | {t('14 Month Report (Salary)')}
        </title>
      </Head>
      {isReady && accountListId ? (
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
