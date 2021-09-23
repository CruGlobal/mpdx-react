import React from 'react';
import { useTranslation } from 'react-i18next';
import Head from 'next/head';
import FixCommitmentInfo from '../../../../src/components/Tool/FixCommitmentInfo/FixCommitmentInfo';
import { useAccountListId } from '../../../../src/hooks/useAccountListId';
import Loading from '../../../../src/components/Loading';

const FixCommitmentInfoPage: React.FC = () => {
  const { t } = useTranslation();
  const accountListId = useAccountListId();
  return (
    <>
      <Head>
        <title>MPDX | {t('Fix Commitment Info')}</title>
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
