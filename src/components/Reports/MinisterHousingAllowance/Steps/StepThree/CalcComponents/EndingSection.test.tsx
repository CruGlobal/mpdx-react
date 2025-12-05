import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render } from '@testing-library/react';
import { Formik } from 'formik';
import * as yup from 'yup';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import { MinisterHousingAllowanceProvider } from '../../../Shared/Context/MinisterHousingAllowanceContext';
import { EndingSection } from './EndingSection';

const submit = jest.fn();

const mockSchema = {
  validateSyncAt: jest.fn((_fieldName, _values) => {
    return null;
  }),
} as unknown as yup.Schema;

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <TestRouter>
        <GqlMockedProvider>
          <MinisterHousingAllowanceProvider>
            <Formik initialValues={{}} onSubmit={submit}>
              <EndingSection schema={mockSchema} />
            </Formik>
          </MinisterHousingAllowanceProvider>
        </GqlMockedProvider>
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

    expect(
      getByText(
        /this email address and phone number will be used to contact you regarding this request/i,
      ),
    ).toBeInTheDocument();
  });
});
