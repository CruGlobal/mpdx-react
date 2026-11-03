import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render } from '@testing-library/react';
import { Formik } from 'formik';
import {
  desktopWidth,
  getGridColumnsAtWidth,
  getStyleAtWidth,
  phoneWidth,
} from '__tests__/util/styleAtWidth';
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

interface TestComponentProps {
  facebookAccounts?: PersonUpdateInput['facebookAccounts'];
}

const TestComponent: React.FC<TestComponentProps> = ({ facebookAccounts }) => (
  <LocalizationProvider dateAdapter={AdapterLuxon}>
    <ThemeProvider theme={theme}>
      <Formik<(PersonUpdateInput | PersonCreateInput) & NewSocial>
        initialValues={{ ...initialValues, facebookAccounts }}
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

  describe('social account layout', () => {
    const renderSocial = () => {
      const { getByRole } = render(
        <TestComponent
          facebookAccounts={[{ id: 'facebook-1', username: 'test guy' }]}
        />,
      );
      return {
        usernameItem: getByRole('textbox', {
          name: 'Facebook Account',
        }).closest('.MuiGrid-root') as Element,
        typeItem: getByRole('combobox', { name: /^Type/ }).closest(
          '.MuiGrid-root',
        ) as Element,
        deleteButton: getByRole('button', {
          name: 'Modal Section Delete Icon',
        }),
      };
    };

    it('stacks Username/URL and Type on phones and keeps the delete button clear of Type', () => {
      const { usernameItem, typeItem, deleteButton } = renderSocial();

      expect(getGridColumnsAtWidth(usernameItem, phoneWidth)).toBe(12);
      expect(getGridColumnsAtWidth(typeItem, phoneWidth)).toBe(12);
      expect(getStyleAtWidth(deleteButton, 'bottom', phoneWidth)).toBe('0');

      // The 40px delete button sits in the section's right gutter plus the
      // Type cell's right padding, so together they must leave it 40px
      const section = typeItem.closest('.MuiBox-root') as Element;
      const rightGutter = parseFloat(
        getStyleAtWidth(section, 'padding', phoneWidth).split(' ')[1],
      );
      const typePadding = parseFloat(
        getStyleAtWidth(typeItem, 'padding-right', phoneWidth),
      );
      expect(typePadding).toBe(16);
      expect(rightGutter + typePadding).toBeGreaterThanOrEqual(40);
    });

    it('keeps Username/URL and Type side by side at 600px and up', () => {
      const { usernameItem, typeItem } = renderSocial();

      [600, desktopWidth].forEach((width) => {
        expect(getGridColumnsAtWidth(usernameItem, width)).toBe(6);
        expect(getGridColumnsAtWidth(typeItem, width)).toBe(6);
        expect(getStyleAtWidth(typeItem, 'padding-right', width)).toBe('');
      });
    });
  });
});
