import React, { ReactElement } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { Box } from '@material-ui/core';
import PageHeading from '../../../../src/components/PageHeading';
import { DesignationAccountsReportTable } from '../../../../src/components/Reports/DesignationAccountsReport/DesignationAccountsReportTable';
import Loading from '../../../../src/components/Loading';
import { useAccountListId } from '../../../../src/hooks/useAccountListId';

const DesignationAccountsReportPage = (): ReactElement => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();

  return (
    <>
      <Head>
        <title>
          MPDX | {t('Reports')} | {t('Designation Accounts')}
        </title>
      </Head>
      {accountListId ? (
        <Box>
          <PageHeading heading={t('Designation Accounts')} />
          <DesignationAccountsReportTable accountListId={accountListId} />
        </Box>
      ) : (
        <Loading loading />
      )}
    </>
  );
};

export default DesignationAccountsReportPage;
