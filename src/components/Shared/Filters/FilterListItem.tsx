import { ListItem, ListItemText } from '@material-ui/core';
import React from 'react';
import {
  Filter,
  CheckboxFilter,
  DaterangeFilter,
  MultiselectFilter,
  NumericRangeFilter,
  RadioFilter,
  TextFilter,
  ContactFilterSetInput,
} from '../../../../graphql/types.generated';
import { FilterListItemCheckbox } from './FilterListItemCheckbox';
import { FilterListItemDateRange } from './FilterListItemDateRange';
import { FilterListItemMultiselect } from './FilterListItemMultiselect';
import { FilterListItemNumericRange } from './FilterListItemNumericRange';
import { FilterListItemSelect } from './FilterListItemSelect';
import { FilterListItemTextField } from './FilterListItemTextField';

interface Props {
  filter: Filter;
  value?: ContactFilterSetInput[keyof ContactFilterSetInput];
  onUpdate: (value?: boolean | string | Array<string>) => void;
}

export const FilterListItem: React.FC<Props> = ({
  filter,
  value,
  onUpdate,
}: Props) => {
  return (filter as TextFilter).__typename === 'TextFilter' ? (
    <FilterListItemTextField
      filter={filter as TextFilter}
      value={value?.toString()}
      onUpdate={(value) => onUpdate(value)}
    />
  ) : (filter as RadioFilter).__typename === 'RadioFilter' ? (
    <FilterListItemSelect
      filter={filter as RadioFilter}
      value={value?.toString()}
      onUpdate={onUpdate}
    />
  ) : (filter as MultiselectFilter).__typename === 'MultiselectFilter' ? (
    <FilterListItemMultiselect
      filter={filter as MultiselectFilter}
      selected={Array.isArray(value) ? value : undefined}
      onUpdate={onUpdate}
    />
  ) : (filter as DaterangeFilter).__typename === 'DaterangeFilter' ? (
    <FilterListItemDateRange
      filter={filter as DaterangeFilter}
      value={value?.toString()}
      onUpdate={onUpdate}
    />
  ) : (filter as CheckboxFilter).__typename === 'CheckboxFilter' ? (
    <FilterListItemCheckbox
      filter={filter as CheckboxFilter}
      value={!!value}
      onUpdate={onUpdate}
    />
  ) : (filter as NumericRangeFilter).__typename === 'NumericRangeFilter' ? (
    <FilterListItemNumericRange
      filter={filter as NumericRangeFilter}
      value={value?.toString()}
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
