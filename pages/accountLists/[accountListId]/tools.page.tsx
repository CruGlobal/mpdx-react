import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Head from 'next/head';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import ToolHome from 'src/components/Tool/Home/Home';

const ToolsPage = (): ReactElement => {
  const { t } = useTranslation();
  const { appName } = useGetAppSettings();
  return (
    <>
      <Head>
        <title>
          {appName} | {t('Tools')}
        </title>
      </Head>
      <ToolHome />
    </>
  );
};

export default ToolsPage;
