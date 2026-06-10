import React from 'react';
import { Divider, Paper, Typography } from '@mui/material';
import theme from 'src/theme';

interface PresentationSectionCardProps {
  title: string;
  children: React.ReactNode;
  sx?: React.ComponentProps<typeof Paper>['sx'];
}

/**
 * Card used by the goal presentation pages to wrap each printable section
 * (personal information, support needs tables, and charts).
 */
export const PresentationSectionCard: React.FC<
  PresentationSectionCardProps
> = ({ title, children, sx }) => (
  <Paper
    sx={{
      padding: theme.spacing(3),
      marginBottom: theme.spacing(3),
      ...sx,
    }}
  >
    <Typography sx={{ marginBottom: theme.spacing(2) }} variant="h5">
      {title}
    </Typography>

    <Divider sx={{ margin: `${theme.spacing(2)} ${theme.spacing(-3)}` }} />

    {children}
  </Paper>
);
