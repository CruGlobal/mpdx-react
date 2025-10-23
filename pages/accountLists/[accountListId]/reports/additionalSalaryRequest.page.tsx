import Head from 'next/head';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ensureSessionAndAccountList } from 'pages/api/utils/pagePropsHelpers';
import { AdditionalSalaryRequest } from 'src/components/Reports/AdditionalSalaryRequest/AdditionalSalaryRequest';
import useGetAppSettings from 'src/hooks/useGetAppSettings';

const AdditionalSalaryRequestPage: React.FC = () => {
  const { appName } = useGetAppSettings();
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>
          {appName} | {t('Additional Salary Request')}
        </title>
      </Head>
      <AdditionalSalaryRequest />
    </>
  );
};

export const getServerSideProps = ensureSessionAndAccountList;

export default AdditionalSalaryRequestPage;
