import { ListItem, ListItemText } from '@mui/material';
import React from 'react';
import {
  CheckboxFilter,
  DaterangeFilter,
  MultiselectFilter,
  NumericRangeFilter,
  RadioFilter,
  TextFilter,
  DateRangeInput,
  NumericRangeInput,
  InputMaybe,
} from '../../../../graphql/types.generated';
import { FilterListItemCheckbox } from './FilterListItemCheckbox';
import { FilterListItemDateRange } from './FilterListItemDateRange';
import { FilterListItemMultiselect } from './FilterListItemMultiselect';
import { FilterListItemNumericRange } from './FilterListItemNumericRange';
import { FilterListItemSelect } from './FilterListItemSelect';
import { FilterListItemTextField } from './FilterListItemTextField';
import { FilterValue } from './FilterPanel';

type FilterItem =
  | CheckboxFilter
  | DaterangeFilter
  | MultiselectFilter
  | NumericRangeFilter
  | RadioFilter
  | TextFilter;

interface Props {
  filter: FilterItem;
  value?: FilterValue;
  onUpdate: (value?: FilterValue) => void;
}

export const FilterListItem: React.FC<Props> = ({
  filter,
  value,
  onUpdate,
}: Props) => {
  return filter.__typename === 'TextFilter' ? (
    <FilterListItemTextField
      filter={filter}
      value={value?.toString()}
      onUpdate={(value) => onUpdate(value)}
    />
  ) : filter.__typename === 'RadioFilter' ? (
    <FilterListItemSelect
      filter={filter}
      value={value?.toString()}
      onUpdate={onUpdate}
    />
  ) : filter.__typename === 'MultiselectFilter' ? (
    <FilterListItemMultiselect
      filter={filter}
      selected={Array.isArray(value) ? value : undefined}
      onUpdate={onUpdate}
    />
  ) : filter.__typename === 'DaterangeFilter' ? (
    <FilterListItemDateRange
      filter={filter}
      value={value as InputMaybe<DateRangeInput>}
      onUpdate={onUpdate}
    />
  ) : filter.__typename === 'CheckboxFilter' ? (
    <FilterListItemCheckbox
      filter={filter}
      value={!!value}
      onUpdate={onUpdate}
    />
  ) : filter.__typename === 'NumericRangeFilter' ? (
    <FilterListItemNumericRange
      filter={filter}
      value={value as InputMaybe<NumericRangeInput>}
      onUpdate={onUpdate}
    />
  ) : (
    <ListItem>
      <ListItemText
        primary={`Unsupported Filter: ${filter.title} (${filter.filterKey})`}
        primaryTypographyProps={{ variant: 'subtitle1', color: 'error' }}
      />
    </ListItem>
  );
};
