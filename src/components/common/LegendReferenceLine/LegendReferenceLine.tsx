import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

interface LegendReferenceLineProps {
  name: string;
  value: React.ReactNode;
  color: string;
  dashed?: boolean;
}

const Container = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(1),
}));

// This component shows the color, name, and value of a reference line in a recharts graph. It
// should be put in the header of the card containing the graph.
export const LegendReferenceLine: React.FC<LegendReferenceLineProps> = ({
  name,
  value,
  color,
  dashed,
}) => (
  <Container>
    <svg width="23" height="10" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2.5 5 H20.5"
        stroke={color}
        strokeWidth="5"
        strokeDasharray={dashed ? '5,8' : undefined}
        strokeLinecap="round"
      />
    </svg>
    <Typography variant="body1" component="span">
      <strong>{name}</strong> {value}
    </Typography>
  </Container>
);
