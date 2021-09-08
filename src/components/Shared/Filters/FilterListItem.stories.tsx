import React, { ReactElement } from 'react';
import {
  CheckboxFilter,
  DaterangeFilter,
  DateRangeInput,
  DateRangeOption,
  MultiselectFilter,
  NumericRangeFilter,
  NumericRangeInput,
  TextFilter,
} from '../../../../graphql/types.generated';
import { FilterListItem } from './FilterListItem';

export default {
  title: 'Shared/FilterListItem',
};

const checkboxFilter: CheckboxFilter = {
  __typename: 'CheckboxFilter',
  featured: false,
  filterKey: 'checkboxFilter',
  title: 'Checkbox Filter',
};

const daterangeFilter: DaterangeFilter = {
  __typename: 'DaterangeFilter',
  featured: false,
  filterKey: 'dateRangeFilter',
  options: undefined,
  title: 'Date Range Filter',
};

const multiselectFilter: MultiselectFilter = {
  __typename: 'MultiselectFilter',
  defaultSelection: undefined,
  featured: false,
  filterKey: 'multiselectFilter',
  options: [
    { name: 'Option 1', value: '1' },
    { name: 'Option 2', value: '2' },
    { name: 'Option 3', value: '3' },
  ],
  title: 'Multiselect Filter',
};

const numericRangeFilter: NumericRangeFilter = {
  __typename: 'NumericRangeFilter',
  featured: false,
  filterKey: 'numericRangeFilter',
  max: 1.0,
  maxLabel: 'max',
  min: 0.0,
  minLabel: 'min',
  title: 'Numeric Range Filter',
};

const textFieldFilter: TextFilter = {
  __typename: 'TextFilter',
  featured: false,
  filterKey: 'textFieldFilter',
  options: undefined,
  title: 'Text Field Filter',
};

export const CheckboxFilterBlank = (): ReactElement => {
  return (
    <FilterListItem
      filter={checkboxFilter}
      value={undefined}
      onUpdate={() => {}}
    />
  );
};

export const CheckboxFilterFilled = (): ReactElement => {
  return (
    <FilterListItem filter={checkboxFilter} value={true} onUpdate={() => {}} />
  );
};

export const DateRangeFilterBlank = (): ReactElement => {
  return (
    <FilterListItem
      filter={daterangeFilter}
      value={undefined}
      onUpdate={() => {}}
    />
  );
};

export const DateRangeFilterFilled = (): ReactElement => {
  const dateRange: DateRangeInput = { min: '2021-08-01', max: '2021-08-30' };

  return (
    <FilterListItem
      filter={daterangeFilter}
      value={dateRange}
      onUpdate={() => {}}
    />
  );
};

export const DateRangeFilterOptions = (): ReactElement => {
  const dateRangeOptions: DateRangeOption[] = [
    { name: '1', rangeStart: '2021-06-01', rangeEnd: '2021-06-31' },
    { name: '1', rangeStart: '2021-07-01', rangeEnd: '2021-07-31' },
    { name: '1', rangeStart: '2021-08-01', rangeEnd: '2021-08-31' },
  ];

  const daterangeFilterWithOptions: DaterangeFilter = {
    ...daterangeFilter,
    options: dateRangeOptions,
  };

  return (
    <FilterListItem
      filter={daterangeFilterWithOptions}
      value={undefined}
      onUpdate={() => {}}
    />
  );
};

export const MultiselectFilterBlank = (): ReactElement => {
  return (
    <FilterListItem
      filter={multiselectFilter}
      value={undefined}
      onUpdate={() => {}}
    />
  );
};

export const MultiselectFilterFilled = (): ReactElement => {
  return (
    <FilterListItem
      filter={multiselectFilter}
      value={['1', '2']}
      onUpdate={() => {}}
    />
  );
};

export const NumericRangeFilterBlank = (): ReactElement => {
  return (
    <FilterListItem
      filter={numericRangeFilter}
      value={undefined}
      onUpdate={() => {}}
    />
  );
};

export const NumericRangeFilterFilled = (): ReactElement => {
  const numericRange: NumericRangeInput = { min: 0.0, max: 1.0 };

  return (
    <FilterListItem
      filter={numericRangeFilter}
      value={numericRange}
      onUpdate={() => {}}
    />
  );
};

export const TextFieldFilterBlank = (): ReactElement => {
  return (
    <FilterListItem
      filter={textFieldFilter}
      value={undefined}
      onUpdate={() => {}}
    />
  );
};

export const TextFieldFilterFilled = (): ReactElement => {
  return (
    <FilterListItem
      filter={textFieldFilter}
      value={'Text'}
      onUpdate={() => {}}
    />
  );
};
