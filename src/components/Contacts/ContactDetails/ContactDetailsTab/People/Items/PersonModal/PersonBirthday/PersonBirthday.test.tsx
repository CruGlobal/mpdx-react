import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { fireEvent, render } from '@testing-library/react';
import { FormikProps } from 'formik';
import { DateTime } from 'luxon';
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
  it('handles Enter key press with empty input', () => {
    const { getByLabelText } = render(<TestComponent />);
    const birthdayInput = getByLabelText('Birthday') as HTMLInputElement;
    fireEvent.keyDown(birthdayInput, { key: 'Enter', target: { value: '' } });
    expect(birthdayInput.value).toBe('');
  });

  it('handles Enter key press with valid date input', () => {
    jest.spyOn(DateTime, 'fromFormat').mockImplementation(() => DateTime.now());
    const { getByLabelText } = render(<TestComponent />);
    const birthdayInput = getByLabelText('Birthday') as HTMLInputElement;
    fireEvent.keyDown(birthdayInput, {
      key: 'Enter',
      target: { value: '6/15/2022' },
    });
    expect(DateTime.fromFormat).toHaveBeenCalledWith('6/15/2022', 'M/d/yyyy');
  });

  it('renders birthday field with label', () => {
    const { getByLabelText } = render(<TestComponent />);
    expect(getByLabelText('Birthday')).toBeInTheDocument();
  });

  it('displays valid date when values are provided', () => {
    const { getByLabelText } = render(<TestComponent />);
    const birthdayInput = getByLabelText('Birthday') as HTMLInputElement;
    expect(birthdayInput.value).toBe('06/15/1990');
  });

  it('handles null date values', () => {
    const nullFormikProps = {
      values: {
        birthdayDay: null,
        birthdayMonth: null,
        birthdayYear: null,
      },
    } as FormikProps<(PersonUpdateInput | PersonCreateInput) & NewSocial>;

    const { getByLabelText } = render(
      <TestComponent formikProps={nullFormikProps} />,
    );
    const birthdayInput = getByLabelText('Birthday') as HTMLInputElement;
    expect(birthdayInput.value).toBe('');
  });

  it('handles partial date values', () => {
    const partialFormikProps = {
      values: {
        birthdayDay: 15,
        birthdayMonth: null,
        birthdayYear: 1990,
      },
    } as FormikProps<(PersonUpdateInput | PersonCreateInput) & NewSocial>;

    const { getByLabelText } = render(
      <TestComponent formikProps={partialFormikProps} />,
    );
    expect(getByLabelText('Birthday')).toBeInTheDocument();
  });
});
