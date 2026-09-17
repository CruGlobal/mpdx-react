import React from 'react';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAssistantContext } from './AssistantProvider';
import { useAssistantVisibility } from './useAssistantVisibility';

export const AssistantLauncher: React.FC = () => {
  const { t } = useTranslation();
  const visible = useAssistantVisibility();
  const { openAssistant } = useAssistantContext();

  if (!visible) {
    return null;
  }

  return (
    <IconButton
      color="inherit"
      aria-label={t('Open Assistant')}
      onClick={openAssistant}
    >
      <AutoAwesomeIcon />
    </IconButton>
  );
};
