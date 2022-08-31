import { ListItem, ListItemText, useTheme } from '@mui/material';
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
  const theme = useTheme();

  return (
    <ListItem button onClick={onToggle} data-testid="FilterListItemShowAll">
      <ListItemText
        primary={showAll ? t('See Fewer Filters') : t('See More Filters')}
        primaryTypographyProps={{
          variant: 'subtitle1',
        }}
        style={{ color: theme.palette.info.main }}
      />
      {showAll ? (
        <ExpandLess style={{ color: theme.palette.info.main }} />
      ) : (
        <ExpandMore style={{ color: theme.palette.info.main }} />
      )}
    </ListItem>
  );
};
