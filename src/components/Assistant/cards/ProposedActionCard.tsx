import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ProposedActionCardData } from '../types';

interface ProposedActionCardProps {
  card: ProposedActionCardData;
}

// Placeholder that shows the raw fields until Tier 3 designs the proposed action card
export const ProposedActionCard: React.FC<ProposedActionCardProps> = ({
  card,
}) => {
  const { t } = useTranslation();

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="body2">
          {t('Proposed action')}: {card.action.type}
        </Typography>
        <Typography
          variant="caption"
          component="pre"
          sx={{ m: 0, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}
        >
          {JSON.stringify(card.action.params, null, 2)}
        </Typography>
      </CardContent>
    </Card>
  );
};
