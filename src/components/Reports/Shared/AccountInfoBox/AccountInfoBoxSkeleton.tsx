import React from 'react';
import { Box, Skeleton, styled } from '@mui/material';

const StyledAccountInfoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: theme.spacing(3),
  marginBottom: theme.spacing(2),
}));

const StyledSkeletonBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.grey[300],
  width: 120,
  height: 24,
  display: 'inline-block',
  borderRadius: theme.spacing(0.5),
}));

export const AccountInfoBoxSkeleton: React.FC = () => (
  <StyledAccountInfoContainer data-testid="account-info">
    <Skeleton variant="text" data-testid="name-skeleton">
      <StyledSkeletonBox />
    </Skeleton>
    <Skeleton variant="text" data-testid="account-id-skeleton">
      <StyledSkeletonBox />
    </Skeleton>
  </StyledAccountInfoContainer>
);
