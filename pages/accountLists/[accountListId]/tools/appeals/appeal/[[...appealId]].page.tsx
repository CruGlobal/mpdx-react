import Head from 'next/head';
import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { blockRestrictedImpersonation } from 'pages/api/utils/pagePropsHelpers';
import AppealsDetailsPage from 'src/components/Tool/Appeal/AppealDetails/AppealsDetailsPage';
import { getAppName } from 'src/lib/getAppName';
import { AppealsWrapper } from '../AppealsWrapper';

const Appeals = (): ReactElement => {
  const { t } = useTranslation();
  const appName = getAppName();
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

export const getServerSideProps = blockRestrictedImpersonation;
