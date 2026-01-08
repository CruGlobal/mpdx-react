import React from 'react';
import { Box, Skeleton, Stack } from '@mui/material';
import theme from 'src/theme';
import { mainContentWidth } from './AdditionalSalaryRequest';

export const AdditionalSalaryRequestSkeleton: React.FC = () => {
  return (
    <Stack
      direction="column"
      sx={{
        gap: theme.spacing(4),
      }}
      width={mainContentWidth}
    >
      <Box>
        <Skeleton variant="text" width="60%" height={40} />
      </Box>

      <Box>
        <Skeleton variant="text" width="100%" height={24} />
        <Skeleton variant="text" width="100%" height={24} />
        <Skeleton variant="text" width="80%" height={24} />
      </Box>

      <Box>
        <Skeleton
          variant="rectangular"
          width="100%"
          height={300}
          sx={{ borderRadius: 1 }}
        />
      </Box>

      <Box>
        <Skeleton variant="rectangular" width={180} height={42} />
      </Box>
    </Stack>
  );
};
