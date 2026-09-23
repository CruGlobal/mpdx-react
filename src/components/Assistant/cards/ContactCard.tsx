import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ContactCardData } from '../types';

interface ContactCardProps {
  card: ContactCardData;
}

// Placeholder that shows the raw fields until Tier 2 designs the contact card
export const ContactCard: React.FC<ContactCardProps> = ({ card }) => {
  const { t } = useTranslation();

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="body2">
          {t('Contact')}: {card.contact_id}
        </Typography>
      </CardContent>
    </Card>
  );
};
