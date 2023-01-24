import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';

interface WeeklyReportProgressProps {
  totalSteps: number;
  activeStep: number;
}

export const WeeklyReportProgress = ({
  totalSteps,
  activeStep,
}: WeeklyReportProgressProps) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}
    mb={1}
    data-testid="WeeklyReportModalStepCounterBox"
  >
    <Box sx={{ width: '100%', mr: 1 }}>
      <LinearProgress
        variant="determinate"
        value={(activeStep / totalSteps) * 100}
      />
    </Box>
    <Box>
      <Typography
        variant="body2"
        color="text.secondary"
        data-testid="WeeklyReportModalStepCounterCount"
      >{`${activeStep}/${totalSteps}`}</Typography>
    </Box>
  </Box>
);
