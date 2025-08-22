import React from 'react';
import { Typography } from '@mui/material';

interface RightPanelProps {
  title: string;
  children?: React.ReactNode;
}

export const RightPanel: React.FC<RightPanelProps> = ({ title, children }) => (
  <>
    <Typography variant="h6" gutterBottom>
      {title}
    </Typography>
    {children}
  </>
);
