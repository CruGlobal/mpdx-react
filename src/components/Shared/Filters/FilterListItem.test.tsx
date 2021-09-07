import React from 'react';
import { render } from '@testing-library/react';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import LuxonUtils from '@date-io/luxon';
import { DateTime } from 'luxon';
import {
  CheckboxFilter,
  DaterangeFilter,
  DateRangeInput,
  MultiselectFilter,
  NumericRangeFilter,
  NumericRangeInput,
  TextFilter,
} from '../../../../graphql/types.generated';
import { FilterListItem } from './FilterListItem';

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
      <MuiPickersUtilsProvider utils={LuxonUtils}>
        <FilterListItem
          filter={daterangeFilter}
          value={undefined}
          onUpdate={() => {}}
        />
      </MuiPickersUtilsProvider>,
    );

    expect(getByText(daterangeFilter.title)).toBeInTheDocument();
    expect(getAllByRole('textbox')[0].getAttribute('value')).toEqual('');
    expect(getAllByRole('textbox')[1].getAttribute('value')).toEqual('');
  });

  it('DateRangeFilter filled', () => {
    const dateRange: DateRangeInput = { min: '2021-08-01', max: '2021-08-30' };
    const convertedMinDate = DateTime.fromISO(dateRange.min || '').toFormat(
      'MM/dd/yyyy',
    );
    const convertedMaxDate = DateTime.fromISO(dateRange.max || '').toFormat(
      'MM/dd/yyyy',
    );

    const { getByText, getAllByRole } = render(
      <MuiPickersUtilsProvider utils={LuxonUtils}>
        <FilterListItem
          filter={daterangeFilter}
          value={dateRange}
          onUpdate={() => {}}
        />
      </MuiPickersUtilsProvider>,
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
    const { getByText, getAllByTestId } = render(
      <FilterListItem
        filter={multiselectFilter}
        value={undefined}
        onUpdate={() => {}}
      />,
    );

    expect(getByText(multiselectFilter.title)).toBeInTheDocument();
    expect(getAllByTestId('MultiSelectOption').length).toEqual(3);
    expect(
      getAllByTestId('CheckboxIcon')[0].getAttribute('class'),
    ).not.toContain('Mui-checked');
    expect(
      getAllByTestId('CheckboxIcon')[1].getAttribute('class'),
    ).not.toContain('Mui-checked');
    expect(
      getAllByTestId('CheckboxIcon')[2].getAttribute('class'),
    ).not.toContain('Mui-checked');
  });

  it('MultiSelectFilter filled', () => {
    const { getByText, getAllByTestId } = render(
      <FilterListItem
        filter={multiselectFilter}
        value={['1', '2']}
        onUpdate={() => {}}
      />,
    );

    expect(getByText(multiselectFilter.title)).toBeInTheDocument();
    expect(getAllByTestId('MultiSelectOption').length).toEqual(3);
    expect(getAllByTestId('CheckboxIcon')[0].getAttribute('class')).toContain(
      'Mui-checked',
    );
    expect(getAllByTestId('CheckboxIcon')[1].getAttribute('class')).toContain(
      'Mui-checked',
    );
    expect(
      getAllByTestId('CheckboxIcon')[2].getAttribute('class'),
    ).not.toContain('Mui-checked');
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

  it('TextFieldFilter blank', async () => {
    const { getByText, getByRole } = render(
      <FilterListItem
        filter={textFieldFilter}
        value={undefined}
        onUpdate={() => {}}
      />,
    );

    expect(getByText(textFieldFilter.title)).toBeInTheDocument();
    expect(getByRole('textbox').getAttribute('value')).toEqual('');
  });

  it('TextFieldFilter filled', async () => {
    const { getByText, getByRole } = render(
      <FilterListItem
        filter={textFieldFilter}
        value={'Text'}
        onUpdate={() => {}}
      />,
    );

    expect(getByText(textFieldFilter.title)).toBeInTheDocument();
    expect(getByRole('textbox').getAttribute('value')).toEqual('Text');
  });
});
