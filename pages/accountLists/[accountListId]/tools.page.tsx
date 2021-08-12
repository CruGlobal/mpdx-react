import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Head from 'next/head';
import ToolHome from 'src/components/Tool/Home/Home';

const ToolsPage = (): ReactElement => {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>MPDX | {t('Tools')}</title>
      </Head>
      <ToolHome />
    </>
  );
};

export default ToolsPage;
