import React from 'react';
import { Box, Skeleton, styled } from '@mui/material';

const StyledAccountInfoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: theme.spacing(3),
  marginBottom: theme.spacing(2),
}));

const StyledSkeletonBox = styled(Box)<{ width: number }>(({ theme }) => ({
  backgroundColor: theme.palette.grey[300],
  width: 120,
  height: 24,
  display: 'inline-block',
  borderRadius: theme.spacing(0.5),
}));

interface AccountInfoItemProps {
  width: number;
}

const AccountInfoItem: React.FC<AccountInfoItemProps> = ({ width }) => (
  <Skeleton variant="text">
    <StyledSkeletonBox width={width} />
  </Skeleton>
);

export const AccountInfoBoxSkeleton: React.FC = () => (
  <StyledAccountInfoContainer data-testid="account-info">
    <AccountInfoItem width={120} />
    <AccountInfoItem width={100} />
  </StyledAccountInfoContainer>
);
