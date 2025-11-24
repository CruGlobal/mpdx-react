import React from 'react';
import { Stack, styled } from '@mui/material';

const StyledStack = styled(Stack)(({ theme }) => ({
  '> *:not(.MuiDivider-root)': {
    paddingInline: theme.spacing(4),
  },
}));

interface SectionPageProps {
  children?: React.ReactNode;
}

export const SectionPage: React.FC<SectionPageProps> = ({ children }) => {
  return <StyledStack spacing={4}>{children}</StyledStack>;
};
