import Head from 'next/head';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { loadSession } from 'pages/api/utils/pagePropsHelpers';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import Loading from '../../../../src/components/Loading';
import FixSendNewsletter from '../../../../src/components/Tool/FixSendNewsletter/FixSendNewsletter';
import { useAccountListId } from '../../../../src/hooks/useAccountListId';

const FixSendNewsletterPage: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { appName } = useGetAppSettings();

  return (
    <>
      <Head>
        <title>
          {appName} | {t('Fix Send Newsletter')}
        </title>
      </Head>
      {accountListId ? (
        <FixSendNewsletter accountListId={accountListId} />
      ) : (
        <Loading loading />
      )}
    </>
  );
};

export const getServerSideProps = loadSession;

export default FixSendNewsletterPage;
