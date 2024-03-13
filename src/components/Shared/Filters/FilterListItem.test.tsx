import React from 'react';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  CheckboxFilter,
  DateRangeInput,
  DaterangeFilter,
  MultiselectFilter,
  NumericRangeFilter,
  NumericRangeInput,
  TextFilter,
} from 'src/graphql/types.generated';
import { FilterListItem } from './FilterListItem';

const checkboxFilter: CheckboxFilter = {
  __typename: 'CheckboxFilter',
  filterKey: 'checkboxFilter',
  title: 'Checkbox Filter',
};

const daterangeFilter: DaterangeFilter = {
  __typename: 'DaterangeFilter',
  filterKey: 'dateRangeFilter',
  options: undefined,
  title: 'Date Range Filter',
};

const multiselectFilter: MultiselectFilter = {
  __typename: 'MultiselectFilter',
  defaultSelection: undefined,
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
  filterKey: 'numericRangeFilter',
  max: 1.0,
  maxLabel: 'max',
  min: 0.0,
  minLabel: 'min',
  title: 'Numeric Range Filter',
};

const textFieldFilter: TextFilter = {
  __typename: 'TextFilter',
  filterKey: 'textFieldFilter',
  options: undefined,
  title: 'Text Field Filter',
};

describe('FilterListItem', () => {
  it('CheckboxFilter blank', () => {
    const { getByTestId, getByText } = render(
      <FilterListItem
        filter={checkboxFilter}
        value={undefined}
        onUpdate={() => {}}
      />,
    );

    expect(getByText(checkboxFilter.title)).toBeInTheDocument();
    expect(getByTestId('CheckboxIcon').getAttribute('class')).not.toContain(
      'Mui-checked',
    );
  });

  it('CheckboxFilter filled', () => {
    const { getByTestId, getByText } = render(
      <FilterListItem
        filter={checkboxFilter}
        value={true}
        onUpdate={() => {}}
      />,
    );

    expect(getByText(checkboxFilter.title)).toBeInTheDocument();
    expect(getByTestId('CheckboxIcon').getAttribute('class')).toContain(
      'Mui-checked',
    );
  });

  it('DateRangeFilter blank', () => {
    const { getByText, getAllByRole } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <FilterListItem
          filter={daterangeFilter}
          value={undefined}
          onUpdate={() => {}}
        />
      </LocalizationProvider>,
    );

    expect(getByText(daterangeFilter.title)).toBeInTheDocument();
    expect(getAllByRole('textbox')[0].getAttribute('value')).toEqual('');
    expect(getAllByRole('textbox')[1].getAttribute('value')).toEqual('');
  });

  it('DateRangeFilter filled', () => {
    const dateRange: DateRangeInput = { min: '2021-08-01', max: '2021-08-30' };
    const convertedMinDate = '08/01/2021';
    const convertedMaxDate = '08/30/2021';

    const { getByText, getAllByRole } = render(
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <FilterListItem
          filter={daterangeFilter}
          value={dateRange}
          onUpdate={() => {}}
        />
      </LocalizationProvider>,
    );

    expect(getByText(daterangeFilter.title)).toBeInTheDocument();
    expect(getAllByRole('textbox')[0].getAttribute('value')).toEqual(
      convertedMinDate,
    );
    expect(getAllByRole('textbox')[1].getAttribute('value')).toEqual(
      convertedMaxDate,
    );
  });

  it('MultiSelectFilter blank', () => {
    const { getAllByText, getByTestId } = render(
      <FilterListItem
        filter={multiselectFilter}
        value={undefined}
        onUpdate={() => {}}
      />,
    );

    expect(getAllByText(multiselectFilter.title)).toHaveLength(3);
    expect(getByTestId('multiSelectFilter')).toBeInTheDocument();
  });

  it('NumericRangeFilter blank', async () => {
    const { getByText, getAllByRole } = render(
      <FilterListItem
        filter={numericRangeFilter}
        value={undefined}
        onUpdate={() => {}}
      />,
    );

    expect(getByText(numericRangeFilter.title)).toBeInTheDocument();
    expect(getAllByRole('spinbutton')[0].getAttribute('value')).toEqual('');
    expect(getAllByRole('spinbutton')[1].getAttribute('value')).toEqual('');
  });

  it('NumericRangeFilter filled', async () => {
    const numericRange: NumericRangeInput = { min: 0.0, max: 1.0 };

    const { getByText, getAllByRole } = render(
      <FilterListItem
        filter={numericRangeFilter}
        value={numericRange}
        onUpdate={() => {}}
      />,
    );

    expect(getByText(numericRangeFilter.title)).toBeInTheDocument();
    expect(getAllByRole('spinbutton')[0].getAttribute('value')).toEqual(
      numericRange.min?.toString(),
    );
    expect(getAllByRole('spinbutton')[1].getAttribute('value')).toEqual(
      numericRange.max?.toString(),
    );
  });

  it('NumericRangeFilter empty value', async () => {
    const numericRange: NumericRangeInput = { min: undefined, max: 1.0 };
    const onUpdate = jest.fn();
    const { getByText, getAllByRole } = render(
      <FilterListItem
        filter={numericRangeFilter}
        value={numericRange}
        onUpdate={onUpdate}
      />,
    );

    expect(getByText(numericRangeFilter.title)).toBeInTheDocument();
    const maxInput = getAllByRole('spinbutton')[1];
    userEvent.type(maxInput, '5');
    waitFor(() => expect(maxInput).toHaveValue('5'));
    waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({ min: undefined, max: 5 }),
    );
  });

  it('NumericRangeFilter changed', async () => {
    const numericRange: NumericRangeInput = { min: 0.0, max: 1.0 };

    const { getByText, getAllByRole } = render(
      <FilterListItem
        filter={numericRangeFilter}
        value={numericRange}
        onUpdate={() => {}}
      />,
    );

    expect(getByText(numericRangeFilter.title)).toBeInTheDocument();
    const minInput = getAllByRole('spinbutton')[0];
    const maxInput = getAllByRole('spinbutton')[1];
    expect(minInput.getAttribute('value')).toEqual(
      numericRange.min?.toString(),
    );
    expect(maxInput.getAttribute('value')).toEqual(
      numericRange.max?.toString(),
    );
    userEvent.type(minInput, '5');
    waitFor(() => expect(minInput).toHaveValue('5'));
    userEvent.type(maxInput, '20');
    waitFor(() => expect(maxInput).toHaveValue('20'));
  });

  it('TextFieldFilter blank', async () => {
    const { getAllByText, getByRole } = render(
      <FilterListItem
        filter={textFieldFilter}
        value={undefined}
        onUpdate={() => {}}
      />,
    );

    expect(getAllByText(textFieldFilter.title)[0]).toBeInTheDocument();
    expect(getByRole('textbox').getAttribute('value')).toEqual('');
  });

  it('TextFieldFilter filled', async () => {
    const { getAllByText, getByRole } = render(
      <FilterListItem
        filter={textFieldFilter}
        value={'Text'}
        onUpdate={() => {}}
      />,
    );

    expect(getAllByText(textFieldFilter.title)[0]).toBeInTheDocument();
    expect(getByRole('textbox').getAttribute('value')).toEqual('Text');
  });
});
