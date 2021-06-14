import React, { ReactElement } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { Box } from '@material-ui/core';
import PageHeading from '../../../../src/components/PageHeading';
import { ResponsibilityCentersReportTable } from '../../../../src/components/Reports/ResponsibilityCentersReport/ResponsibilityCentersReportTable';
import Loading from '../../../../src/components/Loading';
import { useAccountListId } from '../../../../src/hooks/useAccountListId';

const FinancialAccountsReportPage = (): ReactElement => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();

  return (
    <>
      <Head>
        <title>
          MPDX | {t('Reports')} | {t('Responsibility Centers')}
        </title>
      </Head>
      {accountListId ? (
        <Box>
          <PageHeading heading={t('Responsibility Centers')} />
          <ResponsibilityCentersReportTable accountListId={accountListId} />
        </Box>
      ) : (
        <Loading loading />
      )}
    </>
  );
};

export default FinancialAccountsReportPage;
