import React from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { Box, Typography } from '@material-ui/core';
import { PersPrefInfo } from './personal/info/PersPrefInfo';

const PersonalPreferences: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <Head>
        <title>MPDX | {t('Personal Preferences')}</title>
      </Head>
      <Box component="section" padding={2}>
        <Typography component="h1" variant="h4" gutterBottom>
          {t('Preferences')}
        </Typography>
        <PersPrefInfo />
      </Box>
      <Box component="main" padding={2}>
        <div>Main content area</div>
      </Box>
    </>
  );
};

export default PersonalPreferences;
