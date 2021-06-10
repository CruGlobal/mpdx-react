import React, { ReactElement } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import { Box } from '@material-ui/core';
import PageHeading from '../../../../src/components/PageHeading';
import { MonthlyActivitySection } from '../../../../src/components/Reports/DonationsReport/MonthlyActivitySection';
import { DonationsReportTable } from '../../../../src/components/Reports/DonationsReport/DonationsReportTable';
import Loading from '../../../../src/components/Loading';

const DonationsReportPage = (): ReactElement => {
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
          MPDX | {t('Reports')} | {t('Donations')}
        </title>
      </Head>
      {isReady && accountListId ? (
        <Box>
          <PageHeading heading={t('Donations')} />
          <MonthlyActivitySection accountListId={accountListId} />
          <DonationsReportTable accountListId={accountListId} />
        </Box>
      ) : (
        <Loading loading />
      )}
    </>
  );
};

export default DonationsReportPage;
