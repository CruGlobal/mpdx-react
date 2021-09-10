import React from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
// import { useRouter } from 'next/router';

export const PersonalPreferences: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>MPDX | {t('Personal Preferences')}</title>
      </Head>
      <div>Test</div>
    </>
  );
};
