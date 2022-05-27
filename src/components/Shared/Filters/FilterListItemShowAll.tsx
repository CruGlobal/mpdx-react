import { ListItem, ListItemText } from '@material-ui/core';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  showAll: boolean;
  onToggle: () => void;
}

export const FilterListItemShowAll: React.FC<Props> = ({
  showAll,
  onToggle,
}: Props) => {
  const { t } = useTranslation();

  return (
    <ListItem button onClick={onToggle} data-testid="FilterListItemShowAll">
      <ListItemText
        primary={showAll ? t('See Fewer Filters') : t('See More Filters')}
        primaryTypographyProps={{
          variant: 'subtitle1',
        }}
        style={{ color: '#2196F3' }}
      />
      {showAll ? (
        <ExpandLess style={{ color: '#2196F3' }} />
      ) : (
        <ExpandMore style={{ color: '#2196F3' }} />
      )}
    </ListItem>
  );
};
