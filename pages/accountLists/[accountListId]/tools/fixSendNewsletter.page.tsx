import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Head from 'next/head';
import FixSendNewsletter from '../../../../src/components/Tool/FixSendNewsletter/FixSendNewsletter';

const fixCommitmentInfo = (): ReactElement => {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>MPDX | {t('MPDX | Fix Send Newsletter')}</title>
      </Head>
      <FixSendNewsletter />
    </>
  );
};

export default fixCommitmentInfo;
