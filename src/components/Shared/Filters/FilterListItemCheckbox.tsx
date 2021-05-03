import {
  Checkbox,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@material-ui/core';
import React from 'react';
import { Filter } from './Filter';

interface Props {
  filter: Filter;
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
        size="small"
        edge="start"
        value="true"
        color="primary"
        checked={!!value}
        disableRipple
      />
    </ListItemIcon>
    <ListItemText
      primary={filter.title}
      primaryTypographyProps={{ variant: 'subtitle1' }}
    />
  </ListItem>
);
