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
} from '../../../../graphql/types.generated';
import { FilterListItemCheckbox } from './FilterListItemCheckbox';
import { FilterListItemDateRange } from './FilterListItemDateRange';
import { FilterListItemMultiselect } from './FilterListItemMultiselect';
import { FilterListItemSelect } from './FilterListItemSelect';
import { FilterListItemTextField } from './FilterListItemTextField';

interface Props {
  filter: Filter;
  value?: boolean | string | Array<string>;
  onUpdate: (value?: boolean | string | Array<string>) => void;
}

export const FilterListItem: React.FC<Props> = ({
  filter,
  value,
  onUpdate,
}: Props) => {
  return (filter as TextFilter) ? (
    <FilterListItemTextField
      filter={filter}
      value={value?.toString()}
      onUpdate={(value) => onUpdate(value)}
    />
  ) : (filter as RadioFilter) ? (
    <FilterListItemSelect
      filter={filter}
      value={value?.toString()}
      onUpdate={onUpdate}
    />
  ) : (filter as MultiselectFilter) ? (
    <FilterListItemMultiselect
      filter={filter}
      selected={Array.isArray(value) ? value : undefined}
      onUpdate={onUpdate}
    />
  ) : (filter as DaterangeFilter) ? (
    <FilterListItemDateRange
      filter={filter}
      value={value?.toString()}
      onUpdate={onUpdate}
    />
  ) : (filter as CheckboxFilter) ? (
    <FilterListItemCheckbox
      filter={filter}
      value={!!value}
      onUpdate={onUpdate}
    />
  ) : (filter as NumericRangeFilter) ? (
    <></>
  ) : (
    <ListItem>
      <ListItemText
        primary={`Unsupported Filter: ${filter.title} (${filter.filterKey})`}
        primaryTypographyProps={{ variant: 'subtitle1', color: 'error' }}
      />
    </ListItem>
  );
};
