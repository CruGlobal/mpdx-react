import React from 'react';
import { render } from '@testing-library/react';
import {
  DesignationSupportFormType,
  DesignationSupportSalaryType,
  DesignationSupportStatus,
} from 'src/graphql/types.generated';
import {
  PdsGoalCalculationMock,
  PdsGoalCalculatorTestWrapper,
} from '../PdsGoalCalculatorTestWrapper';
import { PdsSummaryTable } from './PdsSummaryTable';

const reimbursableZero = {
  ministryCellPhone: 0,
  ministryInternet: 0,
  mpdNewsletter: 0,
  mpdMiscellaneous: 0,
  accountTransfers: 0,
  otherMonthlyReimbursements: 0,
  conferenceRetreatCosts: 0,
  ministryTravelMeals: 0,
  otherAnnualReimbursements: 0,
};

const salariedFullTimeMock: PdsGoalCalculationMock = {
  salaryOrHourly: DesignationSupportSalaryType.Salaried,
  payRate: 60000,
  hoursWorkedPerWeek: null,
  geographicLocation: null,
  status: DesignationSupportStatus.FullTime,
  benefits: 1500,
  ...reimbursableZero,
};

const hourlyPartTimeMock: PdsGoalCalculationMock = {
  salaryOrHourly: DesignationSupportSalaryType.Hourly,
  payRate: 25,
  hoursWorkedPerWeek: 20,
  geographicLocation: null,
  status: DesignationSupportStatus.PartTime,
  benefits: 0,
  ...reimbursableZero,
};

describe('PdsSummaryTable', () => {
  it('renders the data grid', async () => {
    const { findByRole } = render(
      <PdsGoalCalculatorTestWrapper calculationMock={salariedFullTimeMock}>
        <PdsSummaryTable supportRaised={1000} />
      </PdsGoalCalculatorTestWrapper>,
    );

    expect(
      await findByRole('grid', { name: 'PDS Goal Summary' }),
    ).toBeInTheDocument();
  });

  it('renders salary section rows for salaried full-time', async () => {
    const { findByRole, getByRole } = render(
      <PdsGoalCalculatorTestWrapper calculationMock={salariedFullTimeMock}>
        <PdsSummaryTable supportRaised={1000} />
      </PdsGoalCalculatorTestWrapper>,
    );

    await findByRole('gridcell', { name: 'Gross Monthly Pay' });

    expect(
      getByRole('gridcell', { name: 'Employer ½ FICA' }),
    ).toBeInTheDocument();
    expect(
      getByRole('gridcell', { name: 'Salary Subtotal' }),
    ).toBeInTheDocument();
  });

  it('renders Work Comp row for hourly part-time employees', async () => {
    const { findByRole, getByRole } = render(
      <PdsGoalCalculatorTestWrapper calculationMock={hourlyPartTimeMock}>
        <PdsSummaryTable supportRaised={0} />
      </PdsGoalCalculatorTestWrapper>,
    );

    await findByRole('gridcell', { name: 'Gross Monthly Pay' });

    expect(getByRole('gridcell', { name: 'Work Comp' })).toBeInTheDocument();
  });

  it('renders Benefits row for full-time and not Work Comp', async () => {
    const { findByRole, getByRole, queryByRole } = render(
      <PdsGoalCalculatorTestWrapper calculationMock={salariedFullTimeMock}>
        <PdsSummaryTable supportRaised={0} />
      </PdsGoalCalculatorTestWrapper>,
    );

    await findByRole('gridcell', { name: 'Benefits' });

    expect(getByRole('gridcell', { name: 'Benefits' })).toBeInTheDocument();
    expect(
      queryByRole('gridcell', { name: 'Work Comp' }),
    ).not.toBeInTheDocument();
  });

  it('renders Work Comp row for part-time and not Benefits', async () => {
    const { findByRole, getByRole, queryByRole } = render(
      <PdsGoalCalculatorTestWrapper calculationMock={hourlyPartTimeMock}>
        <PdsSummaryTable supportRaised={0} />
      </PdsGoalCalculatorTestWrapper>,
    );

    await findByRole('gridcell', { name: 'Work Comp' });

    expect(getByRole('gridcell', { name: 'Work Comp' })).toBeInTheDocument();
    expect(
      queryByRole('gridcell', { name: 'Benefits' }),
    ).not.toBeInTheDocument();
  });

  it('renders totals and progress rows', async () => {
    const { findByRole, getByRole } = render(
      <PdsGoalCalculatorTestWrapper calculationMock={salariedFullTimeMock}>
        <PdsSummaryTable supportRaised={1000} />
      </PdsGoalCalculatorTestWrapper>,
    );

    await findByRole('gridcell', { name: 'Attrition' });

    expect(
      getByRole('gridcell', { name: 'Credit Card Fees' }),
    ).toBeInTheDocument();
    expect(getByRole('gridcell', { name: 'Assessment' })).toBeInTheDocument();
    expect(getByRole('gridcell', { name: 'Total Goal' })).toBeInTheDocument();
    expect(
      getByRole('gridcell', { name: 'Solid Monthly Support Developed' }),
    ).toBeInTheDocument();
    expect(
      getByRole('gridcell', { name: 'Monthly Support to be Developed' }),
    ).toBeInTheDocument();
    expect(
      getByRole('gridcell', { name: 'Support Goal Percentage Progress' }),
    ).toBeInTheDocument();
  });

  it('applies hierarchy classes to summary rows', async () => {
    const { findByRole, getByRole } = render(
      <PdsGoalCalculatorTestWrapper calculationMock={salariedFullTimeMock}>
        <PdsSummaryTable supportRaised={1000} />
      </PdsGoalCalculatorTestWrapper>,
    );

    await findByRole('gridcell', { name: 'Salary Subtotal' });

    const salarySubtotalRow = getByRole('gridcell', {
      name: 'Salary Subtotal',
    }).parentElement;
    expect(salarySubtotalRow).toHaveClass('subtotal');

    const otherSubtotalRow = getByRole('gridcell', {
      name: 'Other Subtotal',
    }).parentElement;
    expect(otherSubtotalRow).toHaveClass('subtotal');

    const totalGoalRow = getByRole('gridcell', {
      name: 'Total Goal',
    }).parentElement;
    expect(totalGoalRow).toHaveClass('total-goal');

    const supportRaisedRow = getByRole('gridcell', {
      name: 'Solid Monthly Support Developed',
    }).parentElement;
    expect(supportRaisedRow).toHaveClass('progress-start');
  });

  it('omits Reimbursable Expenses and 403b Contributions rows when formType is Simple', async () => {
    const { findByRole, queryByRole } = render(
      <PdsGoalCalculatorTestWrapper
        calculationMock={{
          ...salariedFullTimeMock,
          formType: DesignationSupportFormType.Simple,
        }}
      >
        <PdsSummaryTable supportRaised={1000} />
      </PdsGoalCalculatorTestWrapper>,
    );

    // Wait for the grid to render
    await findByRole('gridcell', { name: 'Salary Subtotal' });

    expect(
      queryByRole('gridcell', { name: 'Reimbursable Expenses' }),
    ).not.toBeInTheDocument();
    expect(
      queryByRole('gridcell', { name: '403b Contributions' }),
    ).not.toBeInTheDocument();
  });

  it('renders Benefits / Work Comp + totals rows when formType is Simple', async () => {
    const { findByRole, getByRole } = render(
      <PdsGoalCalculatorTestWrapper
        calculationMock={{
          ...salariedFullTimeMock,
          formType: DesignationSupportFormType.Simple,
        }}
      >
        <PdsSummaryTable supportRaised={0} />
      </PdsGoalCalculatorTestWrapper>,
    );

    await findByRole('gridcell', { name: 'Benefits' });

    expect(getByRole('gridcell', { name: 'Other Subtotal' })).toBeInTheDocument();
    expect(getByRole('gridcell', { name: 'Total Goal' })).toBeInTheDocument();
  });

  it('renders Work Comp without Benefits or detailed rows when formType is Simple and status is PartTime', async () => {
    const { findByRole, getByRole, queryByRole } = render(
      <PdsGoalCalculatorTestWrapper
        calculationMock={{
          ...hourlyPartTimeMock,
          formType: DesignationSupportFormType.Simple,
        }}
      >
        <PdsSummaryTable supportRaised={0} />
      </PdsGoalCalculatorTestWrapper>,
    );

    await findByRole('gridcell', { name: 'Work Comp' });

    expect(getByRole('gridcell', { name: 'Work Comp' })).toBeInTheDocument();
    expect(
      queryByRole('gridcell', { name: 'Benefits' }),
    ).not.toBeInTheDocument();
    expect(
      queryByRole('gridcell', { name: 'Reimbursable Expenses' }),
    ).not.toBeInTheDocument();
    expect(
      queryByRole('gridcell', { name: '403b Contributions' }),
    ).not.toBeInTheDocument();
  });

  it('renders Reimbursable Expenses and 403b Contributions rows when formType is Detailed', async () => {
    const { findByRole, getByRole } = render(
      <PdsGoalCalculatorTestWrapper
        calculationMock={{
          ...salariedFullTimeMock,
          formType: DesignationSupportFormType.Detailed,
        }}
      >
        <PdsSummaryTable supportRaised={1000} />
      </PdsGoalCalculatorTestWrapper>,
    );

    await findByRole('gridcell', { name: 'Reimbursable Expenses' });

    expect(
      getByRole('gridcell', { name: 'Reimbursable Expenses' }),
    ).toBeInTheDocument();
    expect(
      getByRole('gridcell', { name: '403b Contributions' }),
    ).toBeInTheDocument();
  });
});
