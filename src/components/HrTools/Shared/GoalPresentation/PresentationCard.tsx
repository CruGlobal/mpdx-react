import React from 'react';
import { Divider, Paper, Typography, styled } from '@mui/material';
import theme from 'src/theme';

interface PresentationCardProps {
  title: string;
  children: React.ReactNode;
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),

  '@media print': {
    pageBreakInside: 'avoid',
  },
}));

/**
 * Card used by the goal presentation pages to wrap each printable section
 * (personal information, support needs tables, and charts).
 */
export const PresentationCard: React.FC<PresentationCardProps> = ({
  title,
  children,
}) => (
  <StyledPaper>
    <Typography sx={{ marginBottom: theme.spacing(2) }} variant="h5">
      {title}
    </Typography>

    <Divider sx={{ margin: `${theme.spacing(2)} ${theme.spacing(-3)}` }} />

    {children}
  </StyledPaper>
);
