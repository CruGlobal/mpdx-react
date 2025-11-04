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
  it('renders form and options', async () => {
    const { getByRole, getByText } = render(<TestComponent />);

    expect(getByRole('heading', { name: 'Rent or Own?' })).toBeInTheDocument();

    expect(getByText('Rent')).toBeInTheDocument();
    expect(getByText('Own')).toBeInTheDocument();

    await userEvent.click(getByText('Rent'));
    expect(getByRole('radio', { name: 'Rent' })).toBeChecked();

    await userEvent.click(getByText('Own'));
    expect(getByRole('radio', { name: 'Own' })).toBeChecked();
  });
});
