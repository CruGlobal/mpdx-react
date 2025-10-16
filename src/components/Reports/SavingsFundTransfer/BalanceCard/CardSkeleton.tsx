import React from 'react';
import { Box, Card, Skeleton, styled } from '@mui/material';
import { SimpleScreenOnly } from '../../styledComponents';

const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  flex: 1,
  minWidth: 0,
  maxWidth: 'none',
  fontSize: '1.25rem',
  boxShadow: theme.shadows[1],
  display: 'flex',
  flexDirection: 'column',
}));

const StyledIconBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.grey[300],
  borderRadius: theme.spacing(1),
  padding: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 40,
  height: 40,
}));

const StyledCardActionArea = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  margin: 0,
  minHeight: 48,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
}));

export const CardSkeleton: React.FC = () => {
  return (
    <SimpleScreenOnly sx={{ flex: 1, minWidth: 250, display: 'flex' }}>
      <StyledCard variant="outlined" data-testid="balance-card-skeleton">
        <Box display="flex" flexDirection="row" alignItems="center" gap={1}>
          <StyledIconBox data-testid="icon-skeleton">
            <Skeleton variant="rectangular" width={24} height={24} />
          </StyledIconBox>
          <Skeleton
            data-testid="text-skeleton"
            variant="text"
            width={80}
            height={28}
          />
        </Box>

        <Box display="flex" flexDirection="column" mt={4} mb={1}>
          <Skeleton
            data-testid="text-skeleton"
            variant="text"
            width="25%"
            height={24}
            sx={{ mb: 0.5 }}
          />
          <Skeleton
            data-testid="text-skeleton"
            variant="text"
            width="30%"
            height={24}
          />
        </Box>

        <StyledCardActionArea>
          <Box display="flex" alignItems="center" gap={1} width="100%">
            <Skeleton
              data-testid="circle-skeleton"
              variant="circular"
              width={20}
              height={20}
            />
            <Skeleton
              data-testid="text-skeleton"
              variant="text"
              width="100%"
              height={20}
            />
          </Box>
        </StyledCardActionArea>
      </StyledCard>
    </SimpleScreenOnly>
  );
};
