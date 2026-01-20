import React from 'react';
import { Box, Card, Skeleton } from '@mui/material';
import { styled } from '@mui/material/styles';
import theme from 'src/theme';

const StyledCard = styled(Card)(() => ({
  margin: theme.spacing(2),
  padding: theme.spacing(2),
  boxShadow: theme.shadows[1],
  fontSize: '1.25rem',
  display: 'inline-block',
}));

export const CardSkeleton: React.FC = () => {
  return (
    <StyledCard variant="outlined" data-testid="CardSkeleton">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: 6,
          justifyContent: 'space-between',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Skeleton
            variant="rectangular"
            width={40}
            height={40}
            sx={{ borderRadius: 1 }}
          />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width={200} height={15} sx={{ mb: 1 }} />
            <Skeleton variant="text" width={80} height={30} sx={{ mb: 1 }} />
          </Box>
        </Box>

        <Box
          sx={{
            flex: 1,
          }}
        >
          <Skeleton variant="text" width={200} height={15} sx={{ mb: 1 }} />
          <Skeleton variant="text" width={80} height={30} />
        </Box>
      </Box>
    </StyledCard>
  );
};
