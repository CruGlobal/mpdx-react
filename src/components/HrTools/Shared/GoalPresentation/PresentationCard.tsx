import React from 'react';
import { Box, Divider, Paper, Typography, styled } from '@mui/material';
import theme from 'src/theme';

interface PresentationCardProps {
  title: string;
  children: React.ReactNode;
  /**
   * Wraps the card body in a horizontally scrollable container so wide content
   * (e.g. tables) scrolls within the card instead of the whole page. Defaults
   * to `true`; set `false` for cards whose content already fits the width, such
   * as charts that size themselves to their container.
   */
  horizontalScroll?: boolean;
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
  horizontalScroll = true,
}) => (
  <StyledPaper>
    <Typography sx={{ marginBottom: theme.spacing(2) }} variant="h5">
      {title}
    </Typography>

    <Divider sx={{ margin: `${theme.spacing(2)} ${theme.spacing(-3)}` }} />

    {horizontalScroll ? (
      <Box sx={{ width: '100%', overflowX: 'auto' }}>{children}</Box>
    ) : (
      children
    )}
  </StyledPaper>
);
