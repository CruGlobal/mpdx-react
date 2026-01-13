import React from 'react';
import { styled } from '@mui/material';
import { Category } from './Category';

const LegendContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: theme.spacing(2),
  flexWrap: 'wrap',
  paddingInline: theme.spacing(1),
}));

const LegendItem = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  fontSize: '0.875rem',
}));

const LegendChip = styled('div')({
  width: '1rem',
  height: '1rem',
  borderRadius: '50%',
});

interface LegendProps {
  categories: Category[];
}

export const Legend: React.FC<LegendProps> = ({ categories }) => (
  <LegendContainer>
    {categories.map((category) => (
      <LegendItem key={category.label}>
        <LegendChip sx={{ backgroundColor: category.color }} />
        <span>{category.label}</span>
      </LegendItem>
    ))}
  </LegendContainer>
);
