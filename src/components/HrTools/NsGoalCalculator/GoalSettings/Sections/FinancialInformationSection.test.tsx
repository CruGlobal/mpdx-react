import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Formik } from 'formik';
import {
  NsGoalCalculatorTestWrapper,
  defaultGoalCalculation,
} from '../../NsGoalCalculatorTestWrapper';
import { GoalSettingsSectionProps } from '../goalSettingsSectionProps';
import { FinancialInformationSection } from './FinancialInformationSection';

const defaultProps: GoalSettingsSectionProps = {
  hasSpouse: true,
  seniorStaff: false,
  calculations: defaultGoalCalculation.calculations,
  primaryName: 'John',
  spouseName: 'Jane',
  visibleHeaders: ['John (Joining)', 'Jane (Senior)'],
  sharedHeader: 'John (Joining) & Jane (Senior)',
};

const TestComponent: React.FC<Partial<GoalSettingsSectionProps>> = (
  overrides,
) => (
  <NsGoalCalculatorTestWrapper>
    <Formik
      initialValues={{
        annualRequestedSalary: 0,
        spouseRequestedAnnualSalary: 0,
        contribution403bPercentage: 0,
        spouseContribution403bPercentage: 0,
        spouseMhaAmount: 0,
        staffConferenceTransfer: 0,
        accountTransfers: 0,
        advocacyTransfers: 0,
        geographicLocation: '',
        studentLoanMonthlyPayment: 0,
        carLoanMonthlyPayment: 0,
        creditCardDebtMonthlyPayment: 0,
      }}
      onSubmit={jest.fn()}
    >
      <FinancialInformationSection {...defaultProps} {...overrides} />
    </Formik>
  </NsGoalCalculatorTestWrapper>
);

describe('FinancialInformationSection', () => {
  it('renders the primary editable fields and the geographic location selector', () => {
    const { getByRole } = render(<TestComponent />);

    expect(
      getByRole('spinbutton', { name: 'Annual Requested Salary — John' }),
    ).toBeInTheDocument();
    expect(
      getByRole('spinbutton', { name: '403(b) Contribution — John' }),
    ).toBeInTheDocument();
    expect(
      getByRole('spinbutton', { name: 'Student Loan Payment' }),
    ).toBeInTheDocument();
    expect(
      getByRole('spinbutton', { name: 'Car Loan Payment' }),
    ).toBeInTheDocument();
    expect(
      getByRole('spinbutton', { name: 'Credit Card Payment' }),
    ).toBeInTheDocument();
    expect(
      getByRole('combobox', { name: 'Geographic Location' }),
    ).toBeInTheDocument();
  });

  it('renders spouse columns when there is a spouse', () => {
    const { getByRole } = render(<TestComponent />);

    expect(
      getByRole('spinbutton', { name: 'Annual Requested Salary — Jane' }),
    ).toBeInTheDocument();
    expect(
      getByRole('spinbutton', { name: '403(b) Contribution — Jane' }),
    ).toBeInTheDocument();
  });

  it('omits spouse columns when there is no spouse', () => {
    const { getByRole, queryByRole } = render(
      <TestComponent hasSpouse={false} />,
    );

    expect(
      getByRole('spinbutton', { name: 'Annual Requested Salary — John' }),
    ).toBeInTheDocument();
    expect(
      queryByRole('spinbutton', { name: 'Annual Requested Salary — Jane' }),
    ).not.toBeInTheDocument();
    expect(
      queryByRole('spinbutton', { name: '403(b) Contribution — Jane' }),
    ).not.toBeInTheDocument();
  });

  it('hides the senior-staff-only rows by default', () => {
    const { queryByRole, queryByText } = render(<TestComponent />);

    expect(
      queryByRole('spinbutton', { name: 'MHA Amount' }),
    ).not.toBeInTheDocument();
    expect(
      queryByRole('spinbutton', { name: 'Staff Conference Transfer — John' }),
    ).not.toBeInTheDocument();
    expect(queryByText('Senior Staff Only')).not.toBeInTheDocument();
  });

  it('shows the senior-staff-only rows for senior staff', () => {
    const { getByRole, getAllByText } = render(<TestComponent seniorStaff />);

    expect(getByRole('spinbutton', { name: 'MHA Amount' })).toBeInTheDocument();
    expect(
      getByRole('spinbutton', { name: 'Staff Conference Transfer — John' }),
    ).toBeInTheDocument();
    expect(
      getByRole('spinbutton', { name: 'Account Transfers — John' }),
    ).toBeInTheDocument();
    expect(
      getByRole('spinbutton', { name: 'Advocacy — John' }),
    ).toBeInTheDocument();
    expect(getAllByText('Senior Staff Only')).toHaveLength(4);
  });

  it('renders the calculated monthly 403(b) amount from the calculations prop', () => {
    const { getByText } = render(
      <TestComponent
        calculations={{
          ...defaultProps.calculations,
          contributing403bAmount: 150,
          spouseContributing403bAmount: 200,
        }}
      />,
    );

    expect(getByText('$150.00')).toBeInTheDocument();
    expect(getByText('$200.00')).toBeInTheDocument();
  });

  it('lists the geographic location options from the constants query', async () => {
    const { getByRole, findByRole } = render(<TestComponent />);

    userEvent.click(getByRole('combobox', { name: 'Geographic Location' }));

    expect(
      await findByRole('option', { name: 'Orlando, FL' }),
    ).toBeInTheDocument();
  });

  it('clarifies that the Geographic Location field is the geographic multiplier', () => {
    const { getByText } = render(<TestComponent />);

    expect(
      getByText("Determines staff's cost-of-living multiplier"),
    ).toBeInTheDocument();
  });
});
