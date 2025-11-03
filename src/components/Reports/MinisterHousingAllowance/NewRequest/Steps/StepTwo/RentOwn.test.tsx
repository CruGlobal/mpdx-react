import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Formik } from 'formik';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import { RentOwn } from './RentOwn';

const submit = jest.fn();

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <TestRouter>
      <Formik initialValues={{}} onSubmit={submit}>
        <RentOwn />
      </Formik>
    </TestRouter>
  </ThemeProvider>
);

describe('RentOwn', () => {
  it('renders form and options', () => {
    const { getByRole, getByText } = render(<TestComponent />);

    expect(getByRole('heading', { name: 'Rent or Own?' })).toBeInTheDocument();

    expect(getByText('Rent')).toBeInTheDocument();
    expect(getByText('Own')).toBeInTheDocument();
  });

  it('should show validation error if continue is clicked without selecting an option', async () => {
    const { getByRole, findByRole } = render(<TestComponent />);

    const continueButton = getByRole('button', { name: 'CONTINUE' });
    await userEvent.click(continueButton);

    const alert = await findByRole('alert');
    expect(alert).toBeInTheDocument();

    expect(alert).toHaveTextContent('Your form is missing information.');
  });

  it('renders Cancel and Continue buttons', () => {
    const { getByRole } = render(<TestComponent />);

    expect(getByRole('button', { name: 'CANCEL' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'CONTINUE' })).toBeInTheDocument();
  });
});
