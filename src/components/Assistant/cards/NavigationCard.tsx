import NextLink from 'next/link';
import React, { useContext, useMemo } from 'react';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Button, Typography } from '@mui/material';
import { useOptionalAccountListId } from 'src/hooks/useAccountListId';
import { NavigationVisibilityContext } from '../navigation/NavigationVisibilityContext';
import { buildNavigationHref } from '../navigation/buildNavigationHref';
import { NavigationCardData } from '../types';

interface NavigationCardProps {
  card: NavigationCardData;
}

export const NavigationCard: React.FC<NavigationCardProps> = ({ card }) => {
  const accountListId = useOptionalAccountListId();
  const navigation = useContext(NavigationVisibilityContext);
  // Building while loading would log a drop for a link that may appear once the data arrives
  const href = useMemo(
    () =>
      accountListId && navigation && !navigation.isLoading
        ? buildNavigationHref(card.intent, accountListId, navigation)
        : null,
    [card.intent, accountListId, navigation],
  );

  if (!href) {
    return <Typography variant="body2">{card.label}</Typography>;
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
