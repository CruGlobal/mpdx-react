import React, { ReactElement } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import { Box } from '@material-ui/core';
import { ExpectedMonthlyTotalReportHeader } from '../../../../src/components/Reports/ExpectedMonthlyTotalReport/ExpectedMonthlyTotalReportHeader';
import { ExpectedMonthlyTotalReportTable } from '../../../../src/components/Reports/ExpectedMonthlyTotalReport/ExpectedMonthlyTotalReportTable';
import { ExpectedMonthlyTotalReportEmpty } from '../../../../src/components/Reports/ExpectedMonthlyTotalReport/ExpectedMonthlyTotalReportEmpty';
import Loading from '../../../../src/components/Loading';

const ExpectedMonthlyTotalReportPage = (): ReactElement => {
  const { t } = useTranslation();
  const { query, isReady } = useRouter();

  const { accountListId } = query;

  if (Array.isArray(accountListId)) {
    throw new Error('accountListId should not be an array');
  }

  function createData(
    contact: string,
    contactId: string,
    status: string,
    commitment: string,
    frequency: string,
    converted: string,
    currency: string,
  ) {
    return {
      contact,
      contactId,
      status,
      commitment,
      frequency,
      converted,
      currency,
    };
  }

  const rows = [
    createData(
      'Adriano, Selinda',
      'abc',
      'Partner - Financial',
      '50',
      'Monthly',
      '50',
      'CAD',
    ),
    createData(
      'Adriano, Selinda',
      'abc',
      'Partner - Financial',
      '50',
      'Monthly',
      '50',
      'CAD',
    ),
    createData(
      'Adriano, Selinda',
      'abc',
      'Partner - Financial',
      '50',
      'Monthly',
      '50',
      'CAD',
    ),
    createData(
      'Adriano, Selinda',
      'abc',
      'Partner - Financial',
      '50',
      'Monthly',
      '50',
      'CAD',
    ),
    createData(
      'Adriano, Selinda',
      'abc',
      'Partner - Financial',
      '50',
      'Monthly',
      '50',
      'CAD',
    ),
    createData(
      'Adriano, Selinda',
      'abc',
      'Partner - Financial',
      '50',
      'Monthly',
      '50',
      'CAD',
    ),
  ];

  return (
    <>
      <Head>
        <title>
          MPDX | {t('Reports')} | {t('Expect Monthly Total')}
        </title>
      </Head>
      {isReady && accountListId ? (
        <Box>
          <ExpectedMonthlyTotalReportHeader accountListId={accountListId} />
          <ExpectedMonthlyTotalReportTable
            accountListId={accountListId}
            title={'Donations So Far This Month'}
            data={rows}
          />
          <ExpectedMonthlyTotalReportTable
            accountListId={accountListId}
            title={'Likely Partners This Month'}
            data={rows}
          />
          <ExpectedMonthlyTotalReportTable
            accountListId={accountListId}
            title={'Possible Partners This Month'}
            data={rows}
          />
        </Box>
      ) : (
        <Box>
          <ExpectedMonthlyTotalReportEmpty accountListId={accountListId} />
          <Loading loading />
        </Box>
      )}
    </>
  );
};

export default ExpectedMonthlyTotalReportPage;
