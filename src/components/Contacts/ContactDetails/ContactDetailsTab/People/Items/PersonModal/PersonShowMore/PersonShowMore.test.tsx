import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { fireEvent, render } from '@testing-library/react';
import { Formik } from 'formik';
import { DateTime } from 'luxon';
import {
  PersonCreateInput,
  PersonUpdateInput,
} from 'src/graphql/types.generated';
import theme from 'src/theme';
import { NewSocial } from '../PersonModal';
import { PersonShowMore } from './PersonShowMore';

const initialValues: (PersonUpdateInput | PersonCreateInput) & NewSocial = {
  contactId: 'test-contact-id',
  firstName: '',
  legalFirstName: '',
  gender: null,
  maritalStatus: null,
  anniversaryDay: 1,
  anniversaryMonth: 1,
  anniversaryYear: 1990,
  almaMater: '',
  employer: '',
  occupation: '',
  deceased: false,
  newSocials: [],
};

const TestComponent = () => (
  <LocalizationProvider dateAdapter={AdapterLuxon}>
    <ThemeProvider theme={theme}>
      <Formik<(PersonUpdateInput | PersonCreateInput) & NewSocial>
        initialValues={initialValues}
        onSubmit={() => {}}
      >
        {(formikProps) => <PersonShowMore formikProps={formikProps} />}
      </Formik>
    </ThemeProvider>
  </LocalizationProvider>
);

describe('PersonShowMore', () => {
  it('handles Enter key press with empty input', () => {
    const { getByLabelText } = render(<TestComponent />);
    const anniversaryInput = getByLabelText('Anniversary') as HTMLInputElement;
    fireEvent.keyDown(anniversaryInput, {
      key: 'Enter',
      target: { value: '' },
    });
    expect(anniversaryInput.value).toBe('');
  });

  it('handles Enter key press with valid date input', () => {
    jest.spyOn(DateTime, 'fromFormat').mockImplementation(() => DateTime.now());
    const { getByLabelText } = render(<TestComponent />);
    const anniversaryInput = getByLabelText('Anniversary') as HTMLInputElement;
    fireEvent.keyDown(anniversaryInput, {
      key: 'Enter',
      target: { value: '6/15/2022' },
    });
    expect(DateTime.fromFormat).toHaveBeenCalledWith('6/15/2022', 'M/d/yyyy');
  });

  it('renders form fields', () => {
    const { getByRole, getByDisplayValue } = render(<TestComponent />);
    expect(
      getByRole('textbox', { name: 'Legal First Name' }),
    ).toBeInTheDocument();
    expect(getByRole('combobox', { name: 'Gender' })).toBeInTheDocument();
    expect(
      getByRole('combobox', { name: 'Relationship Status' }),
    ).toBeInTheDocument();
    expect(getByDisplayValue('01/01/1990')).toBeInTheDocument();
    expect(getByRole('checkbox', { name: 'Deceased' })).toBeInTheDocument();
  });

  it('handles null birthday values', () => {
    initialValues.anniversaryDay = null;
    initialValues.anniversaryMonth = null;
    initialValues.anniversaryYear = null;
    const { getByLabelText } = render(<TestComponent />);
    const birthdayInput = getByLabelText('Anniversary') as HTMLInputElement;
    expect(birthdayInput.value).toBe('');
  });
});
