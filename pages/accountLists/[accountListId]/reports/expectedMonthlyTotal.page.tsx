import React, { ReactElement } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { Box } from '@material-ui/core';
import { ExpectedMonthlyTotalReport } from '../../../../src/components/Reports/ExpectedMonthlyTotalReport/ExpectedMonthlyTotalReport';
import { ExpectedMonthlyTotalReportHeader } from '../../../../src/components/Reports/ExpectedMonthlyTotalReport/Header/ExpectedMonthlyTotalReportHeader';
import Loading from '../../../../src/components/Loading';
import { useAccountListId } from '../../../../src/hooks/useAccountListId';

const ExpectedMonthlyTotalReportPage = (): ReactElement => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();

  function createData(
    name: string,
    contactId: string,
    status: string,
    commitment: string,
    frequency: string,
    converted: string,
    currency: string,
    donation: string,
  ) {
    return {
      name,
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
      {accountListId ? (
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
