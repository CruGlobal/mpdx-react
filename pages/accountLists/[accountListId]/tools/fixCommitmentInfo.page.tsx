import React from 'react';
import { useTranslation } from 'react-i18next';
import Head from 'next/head';
import FixCommitmentInfo from '../../../../src/components/Tool/FixCommitmentInfo/FixCommitmentInfo';
import { useAccountListId } from '../../../../src/hooks/useAccountListId';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import Loading from '../../../../src/components/Loading';

const FixCommitmentInfoPage: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  const { appName } = useGetAppSettings();

  return (
    <>
      <Head>
        <title>
          {appName} | {t('Fix Commitment Info')}
        </title>
      </Head>
      {accountListId ? (
        <FixCommitmentInfo accountListId={accountListId} />
      ) : (
        <Loading loading />
      )}
    </>
  );
};

export default FixCommitmentInfoPage;
