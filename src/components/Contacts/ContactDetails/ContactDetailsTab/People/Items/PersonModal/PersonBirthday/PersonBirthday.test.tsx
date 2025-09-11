import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render } from '@testing-library/react';
import { FormikProps } from 'formik';
import {
  PersonCreateInput,
  PersonUpdateInput,
} from 'src/graphql/types.generated';
import theme from 'src/theme';
import { NewSocial } from '../PersonModal';
import { PersonBirthday } from './PersonBirthday';

const mockFormikProps = {
  values: {
    birthdayDay: 15,
    birthdayMonth: 6,
    birthdayYear: 1990,
  },
  errors: {},
  touched: {},
  isSubmitting: false,
  isValidating: false,
  submitCount: 0,
  setFieldValue: () => {},
} as unknown as FormikProps<
  (PersonUpdateInput | PersonCreateInput) & NewSocial
>;

const TestComponent = ({ formikProps = mockFormikProps }) => (
  <LocalizationProvider dateAdapter={AdapterLuxon}>
    <ThemeProvider theme={theme}>
      <PersonBirthday formikProps={formikProps} />
    </ThemeProvider>
  </LocalizationProvider>
);

describe('PersonBirthday', () => {
  it('renders birthday field with label', () => {
    const { getByLabelText } = render(<TestComponent />);
    expect(getByLabelText('Birthday')).toBeInTheDocument();
  });
});
