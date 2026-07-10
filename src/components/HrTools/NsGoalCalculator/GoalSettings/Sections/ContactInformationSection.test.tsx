import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { Formik } from 'formik';
import { I18nextProvider } from 'react-i18next';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import { defaultGoalCalculation } from '../../NsGoalCalculatorTestWrapper';
import { GoalSettingsSectionProps } from '../goalSettingsSectionProps';
import { ContactInformationSection } from './ContactInformationSection';

const marriedProps: GoalSettingsSectionProps = {
  hasSpouse: true,
  seniorStaff: false,
  calculations: defaultGoalCalculation.calculations,
  primaryName: 'John',
  spouseName: 'Jane',
  visibleHeaders: ['John (Joining)', 'Jane (Senior)'],
  sharedHeader: 'John (Joining) & Jane (Senior)',
};

const renderSection = (props: GoalSettingsSectionProps) =>
  render(
    <ThemeProvider theme={theme}>
      <I18nextProvider i18n={i18n}>
        <Formik
          initialValues={{
            firstName: 'John',
            lastName: 'Doe',
            emailAddress: 'john.doe@cru.org',
            spouseFirstName: 'Jane',
            spouseEmailAddress: 'jane.doe@cru.org',
          }}
          onSubmit={jest.fn()}
        >
          <ContactInformationSection {...props} />
        </Formik>
      </I18nextProvider>
    </ThemeProvider>,
  );

describe('ContactInformationSection', () => {
  it('renders the primary editable fields', () => {
    const { getByRole } = renderSection(marriedProps);
    expect(getByRole('textbox', { name: 'First Name' })).toHaveValue('John');
    expect(getByRole('textbox', { name: 'Last Name' })).toHaveValue('Doe');
    expect(getByRole('textbox', { name: 'Email address' })).toHaveValue(
      'john.doe@cru.org',
    );
  });

  it('renders spouse fields when married, with a disabled last-name mirror', () => {
    const { getByRole } = renderSection(marriedProps);
    expect(getByRole('textbox', { name: "Spouse's First Name" })).toHaveValue(
      'Jane',
    );
    expect(getByRole('textbox', { name: "Spouse's Email" })).toHaveValue(
      'jane.doe@cru.org',
    );
    const spouseLastName = getByRole('textbox', { name: "Spouse's Last Name" });
    expect(spouseLastName).toBeDisabled();
    expect(spouseLastName).toHaveValue('Doe');
  });

  it('hides spouse fields when not married', () => {
    const { queryByRole } = renderSection({
      ...marriedProps,
      hasSpouse: false,
    });
    expect(
      queryByRole('textbox', { name: "Spouse's First Name" }),
    ).not.toBeInTheDocument();
  });
});
