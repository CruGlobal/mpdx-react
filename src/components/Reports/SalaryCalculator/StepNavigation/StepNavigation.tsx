import React from 'react';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Box, Button, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

export interface StepNavigationProps {
  onBack: () => void;
  onContinue: () => void;
  isBackDisabled?: boolean;
  isContinueDisabled?: boolean;
}

export const StepNavigation: React.FC<StepNavigationProps> = ({
  onBack,
  onContinue,
  isBackDisabled = false,
  isContinueDisabled = false,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Box display="flex" justifyContent="flex-end">
      <Stack direction="row" spacing={theme.spacing(1)}>
        <Button
          variant="contained"
          startIcon={<ChevronLeftIcon />}
          onClick={onBack}
          disabled={isBackDisabled}
          color="inherit"
        >
          <Typography fontWeight="bold">{t('Back')}</Typography>
        </Button>
        <Button
          variant="contained"
          endIcon={<ChevronRightIcon />}
          onClick={onContinue}
          disabled={isContinueDisabled}
        >
          <Typography fontWeight="bold">{t('Continue')}</Typography>
        </Button>
      </Stack>
    </Box>
  );
};
