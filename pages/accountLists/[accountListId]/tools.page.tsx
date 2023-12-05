import React, { ReactElement } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import ToolHome from 'src/components/Tool/Home/Home';
import useGetAppSettings from 'src/hooks/useGetAppSettings';

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
