import React, { useState } from 'react';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AssistantFirstRunDialog } from './AssistantFirstRunDialog';
import { useAssistantContext } from './AssistantProvider';
import { useAssistantAccess } from './useAssistantVisibility';

export const AssistantLauncher: React.FC = () => {
  const { t } = useTranslation();
  const { launcher } = useAssistantAccess();
  const { openAssistant } = useAssistantContext();
  const [firstRunOpen, setFirstRunOpen] = useState(false);

  if (launcher === 'hidden') {
    return null;
  }

  return (
    <>
      <IconButton
        color="inherit"
        aria-label={t('Open Assistant')}
        onClick={
          launcher === 'enabled' ? openAssistant : () => setFirstRunOpen(true)
        }
      >
        <AutoAwesomeIcon />
      </IconButton>
      <AssistantFirstRunDialog
        open={firstRunOpen}
        onClose={() => setFirstRunOpen(false)}
        onEnabled={openAssistant}
      />
    </>
  );
};
