import { ListItem, TextField } from '@material-ui/core';
import React from 'react';
import { Filter } from './Filter';

interface Props {
  filter: Filter;
  value;
  onUpdate: (value: string) => void;
}

export const FilterListItemTextField: React.FC<Props> = ({
  filter,
  value,
  onUpdate,
}: Props) => {
  return (
    <ListItem>
      <TextField
        style={{ flex: '1 1 auto' }}
        label={filter.title}
        value={value}
        onChange={(event) => onUpdate(event.target.value)}
      />
    </ListItem>
  );
};
