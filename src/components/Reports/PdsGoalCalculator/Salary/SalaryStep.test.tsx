import React from 'react';
import { render } from '@testing-library/react';
import {
  DesignationSupportSalaryType,
  DesignationSupportStatus,
} from 'src/graphql/types.generated';
import {
  PdsGoalCalculationMock,
  PdsGoalCalculatorTestWrapper,
} from '../PdsGoalCalculatorTestWrapper';
import { SalaryStep } from './SalaryStep';

const calculationMock: PdsGoalCalculationMock = {
  salaryOrHourly: DesignationSupportSalaryType.Salaried,
  payRate: 60000,
  hoursWorkedPerWeek: null,
  geographicLocation: null,
  status: DesignationSupportStatus.FullTime,
  benefits: 1500,
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

describe('SalaryStep', () => {
  it('renders the Salary section', async () => {
    const { findByRole } = render(
      <PdsGoalCalculatorTestWrapper calculationMock={calculationMock}>
        <SalaryStep />
      </PdsGoalCalculatorTestWrapper>,
    );

    expect(await findByRole('heading', { name: 'Salary' })).toBeInTheDocument();
  });

  it('renders the Other section', async () => {
    const { findByRole } = render(
      <PdsGoalCalculatorTestWrapper calculationMock={calculationMock}>
        <SalaryStep />
      </PdsGoalCalculatorTestWrapper>,
    );

    expect(await findByRole('heading', { name: 'Other' })).toBeInTheDocument();
  });
});
