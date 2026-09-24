import React from 'react';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { getAppName } from 'src/lib/getAppName';
import { useAssistantLaunch } from './useAssistantLaunch';

export const AssistantLauncher: React.FC = () => {
  const { t } = useTranslation();
  const appName = getAppName();
  const { launcher, open, launch, firstRunDialog } = useAssistantLaunch();

  if (launcher === 'hidden') {
    return null;
  }

  return (
    <>
      <IconButton
        color="inherit"
        aria-label={
          open
            ? t('Close {{appName}} Guide', { appName })
            : t('Open {{appName}} Guide', { appName })
        }
        aria-expanded={open}
        onClick={(event) => launch(event.currentTarget)}
      >
        <AutoAwesomeIcon />
      </IconButton>
      {firstRunDialog}
    </>
  );
};
