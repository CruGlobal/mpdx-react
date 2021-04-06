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
        color="primary"
        primary={showAll ? t('See Fewer Filters') : t('See More Filters')}
        primaryTypographyProps={{
          color: 'primary',
          variant: 'subtitle1',
        }}
      />
      {showAll ? (
        <ExpandLess color="primary" />
      ) : (
        <ExpandMore color="primary" />
      )}
    </ListItem>
  );
};
