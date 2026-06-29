import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { Box, Divider, IconButton, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useMpdGoalAdmin } from '../MpdGoalAdminContext';

export const StaffDetailDrawer: React.FC = () => {
  const { t } = useTranslation();
  const { openMember, closeDrawer } = useMpdGoalAdmin();

  if (!openMember) {
    return null;
  }

  return (
    <Box
      sx={(theme) => ({
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(2),
        p: theme.spacing(3),
        height: '100%',
        width: '100%',
      })}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h6" sx={{ flex: 1 }}>
          {openMember.name}
        </Typography>
        <IconButton aria-label={t('Close')} onClick={closeDrawer} size="small">
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <Typography variant="body2" color="text.secondary">
        {t('Staff details coming soon.')}
      </Typography>
    </Box>
  );
};
