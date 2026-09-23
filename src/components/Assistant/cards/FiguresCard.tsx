import React from 'react';
import { Card, CardContent, Stack, Typography } from '@mui/material';
import { FiguresCardData } from '../types';

interface FiguresCardProps {
  card: FiguresCardData;
}

// Placeholder that shows the raw fields until Tier 2 designs the figures card
export const FiguresCard: React.FC<FiguresCardProps> = ({ card }) => (
  <Card variant="outlined">
    <CardContent>
      <Stack spacing={0.5}>
        {card.items.map((item, index) => (
          <Typography key={index} variant="body2">
            {item.label}: {item.value}
            {item.unit ? ` ${item.unit}` : ''}
          </Typography>
        ))}
      </Stack>
    </CardContent>
  </Card>
);
