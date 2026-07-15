import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as yup from 'yup';
import { NsoMpdQuestionnaireTestWrapper } from '../NsoMpdQuestionnaireTestWrapper';
import { SelectOption, SelectQuestion } from './SelectQuestion';

const schema = yup.object({
  geographicLocation: yup.string().required('Please select an answer.'),
});

const options: SelectOption[] = [
  { value: 'Atlanta, GA', label: 'Atlanta, GA' },
  { value: 'Miami, FL', label: 'Miami, FL' },
];

const TestComponent: React.FC<{
  helperText?: string;
  errorText?: string;
  disabled?: boolean;
}> = ({ helperText, errorText, disabled }) => (
  <NsoMpdQuestionnaireTestWrapper>
    <SelectQuestion
      fieldName="geographicLocation"
      schema={schema}
      label="Nearest city"
      placeholder="Select a city"
      options={options}
      helperText={helperText}
      errorText={errorText}
      disabled={disabled}
    />
  </NsoMpdQuestionnaireTestWrapper>
);

describe('SelectQuestion', () => {
  it('renders the question as a label above the field', () => {
    const { getByRole, getByText } = render(<TestComponent />);

    expect(getByRole('combobox', { name: 'Nearest city' })).toBeInTheDocument();
    // FormLabel renders a <span>; the old floating MUI label was a <label>.
    expect(getByText('Nearest city').tagName).toBe('SPAN');
  });

  it('renders the placeholder and the provided options', async () => {
    const { getByRole, findByRole } = render(<TestComponent />);

    userEvent.click(getByRole('combobox', { name: 'Nearest city' }));

    expect(
      await findByRole('option', { name: 'Atlanta, GA' }),
    ).toBeInTheDocument();
    expect(getByRole('option', { name: 'Miami, FL' })).toBeInTheDocument();
    expect(getByRole('option', { name: 'Select a city' })).toBeInTheDocument();
  });

  it('shows the guidance helper text', () => {
    const { getByText } = render(
      <TestComponent helperText="Choose the closest one." />,
    );

    expect(getByText('Choose the closest one.')).toBeInTheDocument();
  });

  it('replaces the guidance with the validation error once touched while empty', () => {
    const { getByRole, getByText, queryByText } = render(
      <TestComponent helperText="Choose the closest one." />,
    );

    getByRole('combobox', { name: 'Nearest city' }).focus();
    userEvent.tab();

    expect(getByText('Please select an answer.')).toBeInTheDocument();
    expect(queryByText('Choose the closest one.')).not.toBeInTheDocument();
  });

  it('shows an external error message that supersedes field validation', () => {
    const { getByText, queryByText } = render(
      <TestComponent
        errorText="Failed to load"
        helperText="Choose the closest one."
      />,
    );

    expect(getByText('Failed to load')).toBeInTheDocument();
    expect(queryByText('Choose the closest one.')).not.toBeInTheDocument();
    expect(getByText('Nearest city')).toHaveClass('Mui-error');
  });

  it('disables the select when disabled is set', () => {
    const { getByRole } = render(<TestComponent disabled />);

    expect(getByRole('combobox', { name: 'Nearest city' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });
});
