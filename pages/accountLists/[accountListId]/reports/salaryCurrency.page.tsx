import React, { ReactElement, useEffect } from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { getSession } from 'next-auth/client';
import { useTranslation } from 'react-i18next';
import { useApp } from 'src/components/App';
import { SalaryReportTable } from 'src/components/Reports/SalaryReport/SalaryReportTable';
import Loading from 'src/components/Loading';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { ReportLayout } from 'src/components/Reports/ReportLayout/ReportLayout';

const SalaryReportPage = (): ReactElement => {
  const { dispatch } = useApp();
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const router = useRouter();

  useEffect(() => {
    dispatch({
      type: 'updateAccountListId',
      accountListId: router.query.accountListId?.toString() ?? '',
    });
  }, []);

  return (
    <>
      <Head>
        <title>
          MPDX | {t('Reports')} | {t('14 Month Report (Salary)')}
        </title>
      </Head>
      {accountListId ? (
        <ReportLayout selectedId="salaryCurrency">
          <SalaryReportTable
            accountListId={accountListId}
            title="Contributions by Salary Currency"
          />
        </ReportLayout>
      ) : (
        <Loading loading />
      )}
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getSession({ req });

  if (!session?.user['token']) {
    res.writeHead(302, { Location: '/' });
    res.end();
    return { props: {} };
  }

  return {
    props: {},
  };
};

export default SalaryReportPage;
