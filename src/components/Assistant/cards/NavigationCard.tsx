import NextLink from 'next/link';
import React, { useMemo } from 'react';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Button, Typography } from '@mui/material';
import { useOptionalAccountListId } from 'src/hooks/useAccountListId';
import { buildNavigationHref } from '../navigation/buildNavigationHref';
import { useNavigationVisibility } from '../navigation/useNavigationVisibility';
import { NavigationCardData } from '../types';

interface NavigationCardProps {
  card: NavigationCardData;
}

const NavigationLabel: React.FC<{ label: string }> = ({ label }) => (
  <Typography variant="body2">{label}</Typography>
);

const NavigationLink: React.FC<
  NavigationCardProps & { accountListId: string }
> = ({ card, accountListId }) => {
  const { visibility, reportSegments, isLoading } = useNavigationVisibility();
  // Building while loading would log a drop for a link that may appear once the data arrives
  const href = useMemo(
    () =>
      isLoading
        ? null
        : buildNavigationHref(card.intent, accountListId, {
            visibility,
            reportSegments,
          }),
    [card.intent, accountListId, visibility, reportSegments, isLoading],
  );

  if (!href) {
    return <NavigationLabel label={card.label} />;
  }

  return (
    <Button
      component={NextLink}
      href={href}
      variant="outlined"
      size="small"
      endIcon={<ArrowForwardIcon />}
    >
      {card.label}
    </Button>
  );
};

// Pages without an account list also lack the GraphQL client the visibility hook needs
export const NavigationCard: React.FC<NavigationCardProps> = ({ card }) => {
  const accountListId = useOptionalAccountListId();

  return accountListId ? (
    <NavigationLink card={card} accountListId={accountListId} />
  ) : (
    <NavigationLabel label={card.label} />
  );
};
