import { Checkbox, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import React from 'react';
import { CheckboxFilter } from '../../../../graphql/types.generated';

interface Props {
  filter: CheckboxFilter;
  value?: boolean;
  onUpdate: (value: boolean) => void;
}

export const FilterListItemCheckbox: React.FC<Props> = ({
  filter,
  value,
  onUpdate,
}: Props) => (
  <ListItem button onClick={() => onUpdate(!value)}>
    <ListItemIcon>
      <Checkbox
        data-testid="CheckboxIcon"
        edge="start"
        value="true"
        color="secondary"
        checked={!!value}
        disableRipple
      />
    </ListItemIcon>
    <ListItemText
      data-testid="FilterLabel"
      primary={filter.title}
      primaryTypographyProps={{ variant: 'subtitle1' }}
    />
  </ListItem>
);
