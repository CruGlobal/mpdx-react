import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as yup from 'yup';
import theme from 'src/theme';
import { RadioOption, RadioQuestion } from './RadioQuestion';

const schema = yup.object({
  choice: yup.string().required('Please select an answer.'),
});
const options: RadioOption[] = [
  { value: 'A', label: 'Option A' },
  { value: 'B', label: 'Option B' },
];

const TestComponent: React.FC<{ row?: boolean }> = ({ row }) => (
  <ThemeProvider theme={theme}>
    <RadioQuestion
      fieldName="choice"
      schema={schema}
      label="Pick one"
      options={options}
      row={row}
    />
  </ThemeProvider>
);

describe('RadioQuestion', () => {
  it('renders the label and each option', () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('radiogroup', { name: 'Pick one' })).toBeInTheDocument();
    expect(getByRole('radio', { name: 'Option A' })).toBeInTheDocument();
    expect(getByRole('radio', { name: 'Option B' })).toBeInTheDocument();
  });

  it('shows the required error while no option is selected', () => {
    const { getByText } = render(<TestComponent />);

    expect(getByText('Please select an answer.')).toBeInTheDocument();
  });

  it('clears the required error once an option is selected', () => {
    const { getByRole, queryByText } = render(<TestComponent />);

    userEvent.click(getByRole('radio', { name: 'Option A' }));

    expect(queryByText('Please select an answer.')).not.toBeInTheDocument();
  });

  it('links the error to the radio group via aria-describedby', () => {
    const { getByRole, getByText } = render(<TestComponent />);

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
