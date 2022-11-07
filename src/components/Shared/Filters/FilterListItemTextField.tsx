import { ListItem, TextField } from '@mui/material';
import React from 'react';
import { TextFilter } from '../../../../graphql/types.generated';

interface Props {
  filter: TextFilter;
  value?: string;
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
        style={{ flex: 'auto' }}
        label={filter.title}
        value={value}
        onChange={(event) => onUpdate(event.target.value)}
      />
    </ListItem>
  );
};
