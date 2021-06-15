import React, { ReactElement } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { PartnerReportTable } from '../../../../src/components/Reports/PartnerReport/PartnerReportTable';
import Loading from '../../../../src/components/Loading';
import { useAccountListId } from '../../../../src/hooks/useAccountListId';
import ReportLayout from 'src/components/Reports/ReportLayout';

const PartnerReportPage = (): ReactElement => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();

  return (
    <>
      <Head>
        <title>
          MPDX | {t('Reports')} | {t('14-Month Report (Partner)')}
        </title>
      </Head>
      {accountListId ? (
        <ReportLayout
          id="partnerCurrency"
          title="Contributions by Partner Currency"
        >
          <PartnerReportTable accountListId={accountListId} />
        </ReportLayout>
      ) : (
        <Loading loading />
      )}
    </>
  );
};

export default PartnerReportPage;
