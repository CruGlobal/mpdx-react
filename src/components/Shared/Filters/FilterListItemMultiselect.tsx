import {
  Autocomplete,
  Checkbox,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
} from '@mui/material';
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

  const isChecked = (value?: string | null) =>
    selected && selected.some((it) => it === value);

  const toggleCheckValue = (value?: string | null) => {
    if (value && !isChecked(value)) {
      onUpdate(selected ? [...selected, value] : [value]);
    } else {
      onUpdate(selected?.filter((it) => it !== value));
    }
  };

  return (
    <div className="FilterListItemMultiselect-root">
      <ListItem>
        <ListItemText
          primary={filter.title}
          primaryTypographyProps={{ variant: 'subtitle1' }}
        />
      </ListItem>
      {filter.filterKey !== 'pledge_amount' ? (
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
                label={filter.title}
                data-testid="multiSelectFilter"
              />
            )}
          />
        </ListItem>
      ) : (
        filter.options?.map(({ value, name }) => (
          <ListItem key={value} button onClick={() => toggleCheckValue(value)}>
            <ListItemIcon data-testid="MultiSelectOption">
              <Checkbox
                data-testid="CheckboxIcon"
                edge="start"
                color="secondary"
                checked={isChecked(value)}
                disableRipple
              />
            </ListItemIcon>
            <ListItemText
              primary={name}
              primaryTypographyProps={{ variant: 'subtitle1' }}
            />
          </ListItem>
        ))
      )}
    </div>
  );
};
