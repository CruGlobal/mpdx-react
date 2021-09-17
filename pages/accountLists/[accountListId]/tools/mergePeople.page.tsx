import React from 'react';
import { useTranslation } from 'react-i18next';
import Head from 'next/head';
import MergePeople from '../../../../src/components/Tool/MergePeople/MergePeople';

const MergePeoplePage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>MPDX | {t('Merge People')}</title>
      </Head>
      <MergePeople />
    </>
  );
};

export default MergePeoplePage;
