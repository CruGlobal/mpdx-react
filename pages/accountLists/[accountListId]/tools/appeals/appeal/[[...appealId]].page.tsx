import Head from 'next/head';
import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { ensureSessionAndAccountList } from 'pages/api/utils/pagePropsHelpers';
import AppealsDetailsPage from 'src/components/Tool/Appeal/AppealDetails/AppealsDetailsPage';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { AppealsWrapper } from '../AppealsWrapper';

const Appeals = (): ReactElement => {
  const { t } = useTranslation();
  const { appName } = useGetAppSettings();
  const pageTitle = t('Appeals');

  return (
    <>
      <Head>
        <title>{`${appName} | ${pageTitle}`}</title>
      </Head>
      <AppealsDetailsPage />
    </>
  );
};

const AppealsPage: React.FC = () => (
  <AppealsWrapper>
    <Appeals />
  </AppealsWrapper>
);

export default AppealsPage;

export const getServerSideProps = ensureSessionAndAccountList;
