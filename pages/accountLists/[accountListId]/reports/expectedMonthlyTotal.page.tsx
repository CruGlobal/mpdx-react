import React, { ReactElement } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import { Box } from '@material-ui/core';
import { ExpectedMonthlyTotalReport } from '../../../../src/components/Reports/ExpectedMonthlyTotalReport/ExpectedMonthlyTotalReport';
import { ExpectedMonthlyTotalReportHeader } from '../../../../src/components/Reports/ExpectedMonthlyTotalReport/Header/ExpectedMonthlyTotalReportHeader';
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
    donation: string,
  ) {
    return {
      contact,
      contactId,
      status,
      commitment,
      frequency,
      converted,
      currency,
      donation,
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
      '50',
    ),
    createData(
      'Adriano, Selinda',
      'abc',
      'Partner - Financial',
      '50',
      'Monthly',
      '50',
      'CAD',
      '50',
    ),
    createData(
      'Adriano, Selinda',
      'abc',
      'Partner - Financial',
      '50',
      'Monthly',
      '50',
      'CAD',
      '50',
    ),
    createData(
      'Adriano, Selinda',
      'abc',
      'Partner - Financial',
      '50',
      'Monthly',
      '50',
      'CAD',
      '50',
    ),
    createData(
      'Adriano, Selinda',
      'abc',
      'Partner - Financial',
      '50',
      'Monthly',
      '50',
      'CAD',
      '50',
    ),
    createData(
      'Adriano, Selinda',
      'abc',
      'Partner - Financial',
      '50',
      'Monthly',
      '50',
      'CAD',
      '50',
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
        <ExpectedMonthlyTotalReport
          accountListId={accountListId}
          data={rows}
        ></ExpectedMonthlyTotalReport>
      ) : (
        <Box>
          <ExpectedMonthlyTotalReportHeader empty={true} />
          <Loading loading />
        </Box>
      )}
    </>
  );
};

export default ExpectedMonthlyTotalReportPage;
