import React from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, styled } from '@material-ui/core';

const StyledGroupWrapper = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

interface PersPrefGroupProps {
  title: string;
}

export const PersPrefGroup: React.FC<PersPrefGroupProps> = ({
  title,
  children,
}) => {
  const { t } = useTranslation();

  return (
    <StyledGroupWrapper>
      <Typography component="h3" variant="h5">
        {t(title)}
      </Typography>
      {children}
    </StyledGroupWrapper>
  );
};
