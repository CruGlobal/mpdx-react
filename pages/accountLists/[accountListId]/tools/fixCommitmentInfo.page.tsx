import React from 'react';
import { useTranslation } from 'react-i18next';
import Head from 'next/head';
import FixCommitmentInfo from '../../../../src/components/Tool/FixCommitmentInfo/FixCommitmentInfo';

const FixCommitmentInfoPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>MPDX | {t('Fix Commitment Info')}</title>
      </Head>
      <FixCommitmentInfo />
    </>
  );
};

export default FixCommitmentInfoPage;
