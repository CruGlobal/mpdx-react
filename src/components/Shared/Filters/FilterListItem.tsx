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
import { FilterListItemSlider } from './FilterListItemSlider';
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
  switch (filter.__typename) {
    case 'TextFilter':
      return (
        <FilterListItemTextField
          filter={filter}
          value={value?.toString()}
          onUpdate={(value) => onUpdate(value)}
        />
      );
    case 'RadioFilter':
      return (
        <FilterListItemSelect
          filter={filter}
          value={value?.toString()}
          onUpdate={onUpdate}
        />
      );
    case 'MultiselectFilter':
      return (
        <FilterListItemMultiselect
          filter={filter}
          selected={Array.isArray(value) ? value : undefined}
          onUpdate={onUpdate}
        />
      );
    case 'DaterangeFilter':
      return (
        <FilterListItemDateRange
          filter={filter}
          value={value as InputMaybe<DateRangeInput>}
          onUpdate={onUpdate}
        />
      );
    case 'CheckboxFilter':
      return (
        <FilterListItemCheckbox
          filter={filter}
          value={!!value}
          onUpdate={onUpdate}
        />
      );
    case 'NumericRangeFilter':
      // The donation period report filters should be displayed as sliders
      if (filter.filterKey.startsWith('donation_period_')) {
        return (
          <FilterListItemSlider
            filter={filter}
            value={value as InputMaybe<NumericRangeInput>}
            onUpdate={onUpdate}
          />
        );
      }
      return (
        <FilterListItemNumericRange
          filter={filter}
          value={value as InputMaybe<NumericRangeInput>}
          onUpdate={onUpdate}
        />
      );

    default:
      return (
        <ListItem>
          <ListItemText
            primary={`Unsupported Filter: ${filter.title} (${filter.filterKey})`}
            primaryTypographyProps={{ variant: 'subtitle1', color: 'error' }}
          />
        </ListItem>
      );
  }
};
