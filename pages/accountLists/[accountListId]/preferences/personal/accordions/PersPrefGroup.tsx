import React from 'react';
import { Box, Typography, styled } from '@material-ui/core';

const StyledGroupWrapper = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(3),
}));

interface PersPrefGroupProps {
  title: string;
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
