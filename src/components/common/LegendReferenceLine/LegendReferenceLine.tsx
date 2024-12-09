import React from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

interface LegendReferenceLineProps {
  name: string;
  value: React.ReactNode;
  color: string;
}

const Container = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(1),
}));

const Line = styled(Box)({
  display: 'inline-block',
  height: '5px',
  width: '20px',
  borderRadius: '5px',
});

// This component shows the color, name, and value of a reference line in a recharts graph. It
// should be put in the header of the card containing the graph.
export const LegendReferenceLine: React.FC<LegendReferenceLineProps> = ({
  name,
  value,
  color,
}) => (
  <Container>
    <Line sx={{ backgroundColor: color }} />
    <Typography variant="body1" component="span">
      <strong>{name}</strong> {value}
    </Typography>
  </Container>
);
