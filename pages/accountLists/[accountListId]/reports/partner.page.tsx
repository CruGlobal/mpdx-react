import React, { ReactElement } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import { Box } from '@material-ui/core';
import { PartnerReportTable } from '../../../../src/components/Reports/PartnerReport/PartnerReportTable';
import Loading from '../../../../src/components/Loading';

const PartnerReportPage = (): ReactElement => {
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
          MPDX | {t('Reports')} | {t('14-Month Report (Partner)')}
        </title>
      </Head>
      {isReady && accountListId ? (
        <Box>
          <PartnerReportTable accountListId={accountListId} />
        </Box>
      ) : (
        <Loading loading />
      )}
    </>
  );
};

export default PartnerReportPage;
