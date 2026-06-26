import React from 'react';
import { ThemeProvider } from '@mui/material';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form, Formik } from 'formik';
import theme from 'src/theme';
import { GoalSettingsSelect, SelectOption } from './GoalSettingsSelect';

const options: SelectOption[] = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
];

const TestComponent: React.FC<{ initialValue?: string }> = ({
  initialValue = 'a',
}) => (
  <ThemeProvider theme={theme}>
    <Formik initialValues={{ ministry: initialValue }} onSubmit={jest.fn()}>
      {({ values }) => (
        <Form>
          <GoalSettingsSelect
            name="ministry"
            label="Ministry"
            options={options}
          />
          <output data-testid="values">{JSON.stringify(values)}</output>
        </Form>
      )}
    </Formik>
  </ThemeProvider>
);

describe('GoalSettingsSelect', () => {
  it('renders the label of the initially selected option', () => {
    const { getByRole } = render(<TestComponent initialValue="a" />);

    expect(getByRole('combobox')).toHaveTextContent('Alpha');
  });

  it('writes the chosen option value to Formik state', () => {
    const { getByRole, getByTestId } = render(
      <TestComponent initialValue="a" />,
    );

    userEvent.click(getByRole('combobox'));
    userEvent.click(getByRole('option', { name: 'Beta' }));

    expect(getByTestId('values')).toHaveTextContent('"ministry":"b"');
  });
});
