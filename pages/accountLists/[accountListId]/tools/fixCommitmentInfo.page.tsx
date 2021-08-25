import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Head from 'next/head';
import FixCommitmentInfo from '../../../../src/components/Tool/FixCommitmentInfo/FixCommitmentInfo';

const fixCommitmentInfo = (): ReactElement => {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>MPDX | {t('MPDX | Fix Commitment Info')}</title>
      </Head>
      <FixCommitmentInfo />
    </>
  );
};

export default fixCommitmentInfo;
