import { ListItem, ListItemText } from '@material-ui/core';
import React from 'react';
import { Filter } from './Filter';
import { FilterListItemTextField } from './FilterListItemTextField';

interface Props {
  filter: Filter;
  value;
  onUpdate: (value: string) => void;
}

export const FilterListItem: React.FC<Props> = ({
  filter,
  value,
  onUpdate,
}: Props) => {
  return filter.type == 'text' ? (
    <FilterListItemTextField
      filter={filter}
      value={value}
      onUpdate={onUpdate}
    />
  ) : (
    <ListItem>
      <ListItemText
        primary={filter.title}
        primaryTypographyProps={{ variant: 'subtitle1' }}
      />
    </ListItem>
  );
};
