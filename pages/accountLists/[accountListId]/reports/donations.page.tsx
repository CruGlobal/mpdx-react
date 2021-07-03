import React from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { Box } from '@material-ui/core';
import PageHeading from '../../../../src/components/PageHeading';
import { DonationsReport } from '../../../../src/components/Reports/DonationsReport/DonationsReport';

import Loading from '../../../../src/components/Loading';
import { useAccountListId } from '../../../../src/hooks/useAccountListId';
import { GetDashboardQuery } from '../../GetDashboard.generated';

interface Props {
  data: GetDashboardQuery;
}
const DonationsReportPage: React.FC<Props> = ({ data }) => {
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
          <DonationsReport data={data} accountListId={accountListId} />
        </Box>
      ) : (
        <Loading loading />
      )}
    </>
  );
};

export default DonationsReportPage;
