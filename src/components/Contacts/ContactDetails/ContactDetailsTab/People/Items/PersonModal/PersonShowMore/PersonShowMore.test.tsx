import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render } from '@testing-library/react';
import { Formik } from 'formik';
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
});
