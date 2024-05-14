import React from 'react';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { ListItem, ListItemText } from '@mui/material';
import { useTheme } from '@mui/material/styles';
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
