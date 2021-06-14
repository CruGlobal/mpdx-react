import React, { ReactElement } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { Box } from '@material-ui/core';
import PageHeading from '../../../../src/components/PageHeading';
import { MonthlyActivitySection } from '../../../../src/components/Reports/DonationsReport/MonthlyActivitySection';
import { DonationsReportTable } from '../../../../src/components/Reports/DonationsReport/DonationsReportTable';
import Loading from '../../../../src/components/Loading';
import { useAccountListId } from '../../../../src/hooks/useAccountListId';

const DonationsReportPage = (): ReactElement => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();

  return (
    <>
      <Head>
        <title>
          MPDX | {t('Reports')} | {t('Donations')}
        </title>
      </Head>
      {accountListId ? (
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
