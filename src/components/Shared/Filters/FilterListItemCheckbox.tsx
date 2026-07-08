import React from 'react';
import {
  Checkbox,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { CheckboxFilter } from 'src/graphql/types.generated';

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
  <ListItemButton onClick={() => onUpdate(!value)}>
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
  </ListItemButton>
);
