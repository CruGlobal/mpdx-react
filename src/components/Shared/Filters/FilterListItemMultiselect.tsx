import { ListItem, ListItemText, TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import React from 'react';
import { MultiselectFilter } from '../../../../graphql/types.generated';

interface Props {
  filter: MultiselectFilter;
  selected?: Array<string>;
  onUpdate: (value?: Array<string>) => void;
}

export const FilterListItemMultiselect: React.FC<Props> = ({
  filter,
  selected,
  onUpdate,
}: Props) => {
  const toggleValue = (value?: string[]) => {
    onUpdate(value);
  };

  return (
    <div className="FilterListItemMultiselect-root">
      <ListItem>
        <ListItemText
          primary={filter.title}
          primaryTypographyProps={{ variant: 'subtitle1' }}
        />
      </ListItem>
      <ListItem>
        <Autocomplete
          multiple
          value={selected || []}
          onChange={(_, value) => toggleValue(value)}
          options={filter.options?.map(({ value }) => value) || []}
          getOptionLabel={(option) =>
            filter.options?.find(
              ({ value }) => String(value) === String(option),
            )?.name ?? ''
          }
          filterSelectedOptions
          fullWidth
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={filter.title}
              data-testid="multiSelectFilter"
            />
          )}
        />
      </ListItem>
    </div>
  );
};
