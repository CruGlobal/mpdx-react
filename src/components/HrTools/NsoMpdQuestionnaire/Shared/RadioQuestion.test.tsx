import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as yup from 'yup';
import { NsoMpdQuestionnaireTestWrapper } from '../NsoMpdQuestionnaireTestWrapper';
import { RadioOption, RadioQuestion } from './RadioQuestion';

const schema = yup.object({
  geographicLocation: yup.string().required('Please select an answer.'),
});
const options: RadioOption[] = [
  { value: 'A', label: 'Option A' },
  { value: 'B', label: 'Option B' },
];

const TestComponent: React.FC<{ row?: boolean }> = ({ row }) => (
  <NsoMpdQuestionnaireTestWrapper>
    <RadioQuestion
      fieldName="geographicLocation"
      schema={schema}
      label="Pick one"
      options={options}
      row={row}
    />
  </NsoMpdQuestionnaireTestWrapper>
);

describe('RadioQuestion', () => {
  it('renders the label and each option', () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('radiogroup', { name: 'Pick one' })).toBeInTheDocument();
    expect(getByRole('radio', { name: 'Option A' })).toBeInTheDocument();
    expect(getByRole('radio', { name: 'Option B' })).toBeInTheDocument();
  });

  it('marks the radio group as required', () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('radiogroup', { name: 'Pick one' })).toHaveAttribute(
      'aria-required',
      'true',
    );
  });

  it('shows the required error once the group is touched without a selection', () => {
    const { getByRole, getByText } = render(<TestComponent />);

    getByRole('radio', { name: 'Option A' }).focus();
    userEvent.tab();

    expect(getByText('Please select an answer.')).toBeInTheDocument();
  });

  it('clears the required error once an option is selected', () => {
    const { getByRole, queryByText } = render(<TestComponent />);

    userEvent.click(getByRole('radio', { name: 'Option A' }));

    expect(queryByText('Please select an answer.')).not.toBeInTheDocument();
  });

  it('links the error to the radio group via aria-describedby', () => {
    const { getByRole, getByText } = render(<TestComponent />);

    getByRole('radio', { name: 'Option A' }).focus();
    userEvent.tab();

    const describedBy = getByRole('radiogroup', {
      name: 'Pick one',
    }).getAttribute('aria-describedby');

    expect(describedBy).toBeTruthy();
    expect(getByText('Please select an answer.')).toHaveAttribute(
      'id',
      describedBy,
    );
  });

  it('lays options out in a row when row is set', () => {
    const { getByRole } = render(<TestComponent row />);

    expect(getByRole('radiogroup', { name: 'Pick one' })).toHaveClass(
      'MuiFormGroup-row',
    );
  });
});
