import {
  FormControl,
  InputLabel,
  ListItem,
  MenuItem,
  Select,
} from '@material-ui/core';
import React from 'react';
import { Filter } from './Filter';

interface Props {
  filter: Filter;
  value?: string;
  onUpdate: (value?: string) => void;
}

export const FilterListItemSelect: React.FC<Props> = ({
  filter,
  value,
  onUpdate,
}: Props) => {
  return (
    <ListItem>
      <FormControl style={{ flex: 'auto' }}>
        <InputLabel>{filter.title}</InputLabel>
        <Select
          value={value}
          onChange={(e) => onUpdate(e.target.value as string)}
        >
          {filter.options.map(({ id, name }) => (
            <MenuItem key={id} value={id?.toString()}>
              {name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </ListItem>
  );
};
