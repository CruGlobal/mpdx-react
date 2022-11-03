import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import React from 'react';

const StyledGroupWrapper = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
}));

interface PersPrefGroupProps {
  title: string;
  children?: React.ReactNode;
}

export const PersPrefGroup: React.FC<PersPrefGroupProps> = ({
  title,
  children,
}) => {
  return (
    <StyledGroupWrapper component="section">
      <Typography component="h3" variant="h5">
        {title}
      </Typography>
      {children}
    </StyledGroupWrapper>
  );
};
