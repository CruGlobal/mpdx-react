import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from '@material-ui/core';
import { PreferencesWrapper } from './wrapper';
import { PersPrefInfo } from './personal/info/PersPrefInfo';

const PersonalPreferences: React.FC = () => {
  const { t } = useTranslation();

  return (
    <PreferencesWrapper
      pageTitle={t('Personal Preferences')}
      pageHeading={t('Preferences')}
    >
      <Box component="section">
        <PersPrefInfo />
      </Box>
      <Box component="section" marginTop={3}>
        <div>Main content area</div>
      </Box>
    </PreferencesWrapper>
  );
};

export default PersonalPreferences;
