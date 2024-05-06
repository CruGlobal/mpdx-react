import Head from 'next/head';
import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { loadSession } from 'pages/api/utils/pagePropsHelpers';
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

export const getServerSideProps = loadSession;

export default ToolsPage;
