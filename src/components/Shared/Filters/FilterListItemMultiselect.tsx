import {
  Checkbox,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@material-ui/core';
import { isArray } from 'lodash';
import React from 'react';
import { Filter } from './Filter';

interface Props {
  filter: Filter;
  selected;
  onUpdate: (value) => void;
}

export const FilterListItemMultiselect: React.FC<Props> = ({
  filter,
  selected,
  onUpdate,
}: Props) => {
  const isChecked = (value: string) =>
    isArray(selected)
      ? selected.findIndex((it) => it == value) != -1
      : selected == value;

  const toggleValue = (value: string) => {
    if (isChecked(value)) {
      onUpdate(isArray(selected) ? selected.filter((it) => it != value) : []);
    } else {
      onUpdate(isArray(selected) ? [...selected, value] : [value]);
    }
  };

  return (
    <>
      <ListItem>
        <ListItemText
          primary={filter.title}
          primaryTypographyProps={{ variant: 'subtitle1' }}
        />
      </ListItem>
      {filter.options.map(({ id, name }) => (
        <ListItem key={id} button onClick={() => toggleValue(id)}>
          <ListItemIcon>
            <Checkbox edge="start" checked={isChecked(id)} disableRipple />
          </ListItemIcon>
          <ListItemText
            primary={name}
            primaryTypographyProps={{ variant: 'subtitle1' }}
          />
        </ListItem>
      ))}
    </>
  );
};
