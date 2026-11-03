import React from 'react';
import SwipeIcon from '@mui/icons-material/Swipe';
import { SxProps, Theme, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

// On phones the Flows boards snap one column at a time as you swipe.
export const flowsBoardSnapSx: SxProps<Theme> = {
  scrollSnapType: { xs: 'x mandatory', sm: 'none' },
};

export const flowsColumnSnapSx: SxProps<Theme> = {
  scrollSnapAlign: 'start',
};

const HintText = styled(Typography)(({ theme }) => ({
  display: 'none',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  padding: theme.spacing(1, 2, 0),
  [theme.breakpoints.down('sm')]: {
    display: 'flex',
  },
}));

// Phone-only cue that the Flows board scrolls sideways.
export const FlowsScrollHint: React.FC = () => {
  const { t } = useTranslation();

  return (
    <HintText variant="body2" color="textSecondary">
      <SwipeIcon fontSize="small" />
      {t('Scroll sideways to see more columns.')}
    </HintText>
  );
};
