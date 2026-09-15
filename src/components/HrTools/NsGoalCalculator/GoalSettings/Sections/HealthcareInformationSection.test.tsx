import React from 'react';
import { render } from '@testing-library/react';
import { Formik } from 'formik';
import {
  NsGoalCalculatorTestWrapper,
  defaultGoalCalculation,
} from '../../NsGoalCalculatorTestWrapper';
import { GoalSettingsSectionProps } from '../goalSettingsSectionProps';
import { HealthcareInformationSection } from './HealthcareInformationSection';

const defaultProps: GoalSettingsSectionProps = {
  hasSpouse: true,
  seniorStaff: false,
  calculations: defaultGoalCalculation.calculations,
  primaryName: 'John',
  spouseName: 'Jane',
  visibleHeaders: ['John (Joining)', 'Jane (Senior)'],
  sharedHeader: 'John (Joining) & Jane (Senior)',
  attendee: null,
};

const TestComponent: React.FC<Partial<GoalSettingsSectionProps>> = (
  overrides,
) => (
  <NsGoalCalculatorTestWrapper>
    <Formik
      initialValues={{
        benefitsPlan: '',
        healthcareDependentsCount: 0,
      }}
      onSubmit={jest.fn()}
    >
      <HealthcareInformationSection {...defaultProps} {...overrides} />
    </Formik>
  </NsGoalCalculatorTestWrapper>
);

describe('HealthcareInformationSection', () => {
  it('renders the benefits selection and healthcare dependents fields', () => {
    const { getByRole } = render(<TestComponent />);

    expect(
      getByRole('combobox', { name: 'Benefits Selection' }),
    ).toBeInTheDocument();
    expect(
      getByRole('spinbutton', { name: 'Healthcare Dependents' }),
    ).toBeInTheDocument();
  });

  it('does not render the removed reimbursable expenses field', () => {
    const { queryByRole, queryByText } = render(<TestComponent />);

    expect(
      queryByRole('spinbutton', { name: 'Reimbursable Expenses' }),
    ).not.toBeInTheDocument();
    // The row label lives outside the field, so it has to go with it.
    expect(queryByText('Reimbursable Expenses')).not.toBeInTheDocument();
  });
});
