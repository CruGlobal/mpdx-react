import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render } from '@testing-library/react';
import { Formik } from 'formik';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import { EndingSection } from './EndingSection';

const submit = jest.fn();

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <TestRouter>
        <Formik initialValues={{}} onSubmit={submit}>
          <EndingSection />
        </Formik>
      </TestRouter>
    </LocalizationProvider>
  </ThemeProvider>
);

describe('EndingSection', () => {
  it('renders the component', () => {
    const { getByText, getByRole } = render(<TestComponent />);

    expect(
      getByText(/if the above information is correct, please confirm/i),
    ).toBeInTheDocument();
    expect(
      getByRole('textbox', { name: 'Telephone Number' }),
    ).toBeInTheDocument();
    expect(getByRole('textbox', { name: 'Email' })).toBeInTheDocument();
  });
});
