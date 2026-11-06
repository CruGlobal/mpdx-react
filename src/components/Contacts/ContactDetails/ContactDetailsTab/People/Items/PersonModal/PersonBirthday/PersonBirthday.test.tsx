import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render } from '@testing-library/react';
import { FormikProps } from 'formik';
import {
  desktopWidth,
  getStyleAtWidth,
  phoneWidth,
} from '__tests__/util/styleAtWidth';
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

  describe('cake icon', () => {
    const renderIcon = () => {
      const { getByTestId } = render(<TestComponent />);
      // The positioned box that holds the cake icon in the section's gutter
      return getByTestId('CakeIcon').parentElement as HTMLElement;
    };

    it('lines up with the middle of the date field on phones', () => {
      const icon = renderIcon();

      expect(getStyleAtWidth(icon, 'top', phoneWidth)).toBe('50%');
      expect(getStyleAtWidth(icon, 'transform', phoneWidth)).toBe(
        'translateY(-50%)',
      );
      expect(getStyleAtWidth(icon, 'left', phoneWidth)).toBe('0');
    });

    it('keeps its desktop position at 600px and up', () => {
      const icon = renderIcon();

      [600, desktopWidth].forEach((width) => {
        expect(getStyleAtWidth(icon, 'transform', width)).toBe(
          'translateY(-100%)',
        );
        expect(getStyleAtWidth(icon, 'left', width)).toBe('8px');
      });
    });
  });
});
