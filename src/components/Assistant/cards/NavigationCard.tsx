import React from 'react';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Button } from '@mui/material';
import { NavigationCardData, NavigationIntent } from '../types';

interface NavigationCardProps {
  card: NavigationCardData;
  onNavigate: (intent: NavigationIntent) => void;
}

export const NavigationCard: React.FC<NavigationCardProps> = ({
  card,
  onNavigate,
}) => (
  <Button
    variant="outlined"
    size="small"
    endIcon={<ArrowForwardIcon />}
    onClick={() => onNavigate(card.intent)}
  >
    {card.label}
  </Button>
);
