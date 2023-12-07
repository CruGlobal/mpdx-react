import React from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
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

export default FixSendNewsletterPage;
