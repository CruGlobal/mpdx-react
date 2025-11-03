import React from 'react';
import { Box, Card, Skeleton } from '@mui/material';
import { styled } from '@mui/material/styles';
import theme from 'src/theme';
import { SimpleScreenOnly } from '../../styledComponents';

const StyledCard = styled(Card)(() => ({
  margin: theme.spacing(4),
  padding: theme.spacing(2),
  boxShadow: theme.shadows[1],
  flex: 1,
  minWidth: 0,
  maxWidth: 'none',
  fontSize: '1.25rem',
}));

export const CardSkeleton: React.FC = () => {
  return (
    <SimpleScreenOnly sx={{ flex: 1, minWidth: 250, display: 'flex' }}>
      <StyledCard variant="outlined" data-testid="CardSkeleton">
        {/* Header Section */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 2,
            mb: 2,
          }}
        >
          <Skeleton
            variant="rectangular"
            width={40}
            height={40}
            sx={{ borderRadius: 1 }}
          />
          <Skeleton variant="text" width="20%" height={28} />
        </Box>

        {/* Data Section - Two Columns */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: 4,
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="30%" height={20} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="15%" height={36} />
          </Box>

          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="30%" height={20} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="15%" height={36} />
          </Box>
        </Box>
      </StyledCard>
    </SimpleScreenOnly>
  );
};
