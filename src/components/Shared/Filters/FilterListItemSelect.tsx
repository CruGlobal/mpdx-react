import {
  FormControl,
  InputLabel,
  ListItem,
  MenuItem,
  Select,
} from '@mui/material';
import React from 'react';
import { RadioFilter } from '../../../../graphql/types.generated';

interface Props {
  filter: RadioFilter;
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
          label={filter.title}
          value={value}
          onChange={(e) => onUpdate(e.target.value as string)}
        >
          {filter.options?.map(({ value, name }) => (
            <MenuItem key={value} value={value}>
              {name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </ListItem>
  );
};
